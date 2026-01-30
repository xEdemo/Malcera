const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const { Item, Inventory, Character, User } = require("../models");
const {
	uploadImageToCloudinary,
	deleteFromCloudinary,
	renameCloudinaryPublicId,
} = require("../middleware/imageHelper.js");
const { EQUIP_SLOTS } = require("../utils/enum.js");
const CLOUDINARY_FOLDER = "items - Malcera";
const cloudinary = require("../config/cloudinary.js");

// ---------------- helpers ----------------
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const normalizeKey = (key) => key.trim().toLowerCase().replace(/\s+/g, "-");

const parsePossiblyJSON = (val) => {
	if (val === undefined || val === null) return undefined;
	if (typeof val !== "string") return val;

	const trimmed = val.trim();

	if (
		trimmed === "" ||
		trimmed === "null" ||
		trimmed === "undefined" ||
		trimmed === '""' ||
		trimmed === "''"
	) {
		return undefined;
	}

	const looksJson =
		(trimmed.startsWith("{") && trimmed.endsWith("}")) ||
		(trimmed.startsWith("[") && trimmed.endsWith("]")) ||
		(trimmed.startsWith('"') && trimmed.endsWith('"'));

	if (looksJson) {
		try {
			return JSON.parse(trimmed);
		} catch {
			// fall through
		}
	}

	return trimmed;
};

const coerceBool = (v) => {
	const x = parsePossiblyJSON(v);
	if (x === undefined) return undefined;
	if (typeof x === "boolean") return x;
	if (typeof x !== "string") return undefined;
	if (x === "true") return true;
	if (x === "false") return false;
	return undefined;
};

const coerceNumber = (v) => {
	const x = parsePossiblyJSON(v);
	if (x === undefined) return undefined;
	if (typeof x === "number") return x;
	if (typeof x !== "string") return undefined;

	const n = Number(x);
	return Number.isFinite(n) ? n : undefined;
};

// Deep-clean:
// - converts "" / "null" / "undefined" / null -> undefined
// - removes undefined keys
// - recurses into objects/arrays
const deepClean = (val) => {
	val = parsePossiblyJSON(val);

	if (val === undefined || val === null) return undefined;

	if (Array.isArray(val)) {
		const cleaned = val.map(deepClean).filter((x) => x !== undefined);
		return cleaned.length ? cleaned : undefined;
	}

	if (typeof val === "object") {
		const out = {};
		for (const [k, v] of Object.entries(val)) {
			const cleaned = deepClean(v);
			if (cleaned !== undefined) out[k] = cleaned;
		}
		return Object.keys(out).length ? out : undefined;
	}

	// strings: trim and drop empty
	if (typeof val === "string") {
		const t = val.trim();
		if (!t) return undefined;
		return t;
	}

	return val;
};

const parseBody = (body) => {
	// Start shallow, then clean fields we expect
	const b = { ...body };

	// parse JSON-ish fields at top
	for (const k of [
		"flags",
		"equip",
		"consumable",
		"weapon",
		"armour",
		"circulation",
	]) {
		if (b[k] !== undefined) b[k] = parsePossiblyJSON(b[k]);
	}

	// scalar
	if (b.key !== undefined) b.key = parsePossiblyJSON(b.key);
	if (b.name !== undefined) b.name = parsePossiblyJSON(b.name);
	if (b.description !== undefined)
		b.description = parsePossiblyJSON(b.description);
	if (b.comments !== undefined) b.comments = parsePossiblyJSON(b.comments);

	// coerce booleans
	if (b.flags) {
		b.flags = {
			...b.flags,
			stackable: coerceBool(b.flags.stackable),
			consumable: coerceBool(b.flags.consumable),
			equippable: coerceBool(b.flags.equippable),
		};
	}

	// coerce numbers we currently care about
	if (b.consumable?.healAmount !== undefined) {
		b.consumable.healAmount = coerceNumber(b.consumable.healAmount);
	}
	if (b.weapon?.accuracy !== undefined) {
		b.weapon.accuracy = coerceNumber(b.weapon.accuracy);
	}
	if (b.weapon?.damage?.damageLow !== undefined) {
		b.weapon.damage.damageLow = coerceNumber(b.weapon.damage.damageLow);
	}
	if (b.weapon?.damage?.damageHigh !== undefined) {
		b.weapon.damage.damageHigh = coerceNumber(b.weapon.damage.damageHigh);
	}
	if (b.armour?.rating !== undefined) {
		b.armour.rating = coerceNumber(b.armour.rating);
	}

	// NOW deep-clean everything so nested "" doesn't survive
	return deepClean(b) || {};
};

const validateItemPayload = (body, { isCreate = false } = {}) => {
	const errors = [];

	if (isCreate) {
		if (!isNonEmptyString(body.key)) errors.push("key is required.");
		if (!isNonEmptyString(body.name)) errors.push("name is required.");
		if (!isNonEmptyString(body.description))
			errors.push("description is required.");
	}

	const equippable = body.flags?.equippable;
	const slot = body.equip?.slot;

	if (equippable === true) {
		if (!isNonEmptyString(slot)) {
			errors.push("flags.equippable is true, so equip.slot must be set.");
		} else if (!EQUIP_SLOTS.includes(slot)) {
			errors.push(`equip.slot must be one of: ${EQUIP_SLOTS.join(", ")}`);
		}
	} else {
		// if not equippable, don't allow equip.slot (prevents your pre-validate error)
		if (slot)
			errors.push("equip.slot is set but flags.equippable is false.");
	}

	const consumable = body.flags?.consumable;
	const healAmount = body.consumable?.healAmount;
	if (consumable === true) {
		if (typeof healAmount !== "number") {
			errors.push(
				"flags.consumable is true, so consumable.healAmount is required."
			);
		} else if (healAmount <= 0) {
			errors.push("consumable.healAmount must be > 0.");
		}
	}

	if (body.weapon?.damage) {
		const low = body.weapon.damage.damageLow;
		const high = body.weapon.damage.damageHigh;
		if (typeof low === "number" && typeof high === "number" && low > high) {
			errors.push(
				"weapon.damage.damageLow cannot be greater than damageHigh."
			);
		}
	}

	return errors;
};

// ---------------- controllers ----------------

// @desc    Creates item
// route    POST /api/v1/item
// @access  Private --- Super Admin
const createItem = asyncHandler(async (req, res) => {
	const userId = req.user?._id?.toString();
	const user = await User.findById(userId);
	if (!user) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`No user found with id ${userId}.`);
	}

	const body = parseBody(req.body);

	const errors = validateItemPayload(body, { isCreate: true });
	if (errors.length) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(errors.join(" "));
	}

	if (!req.file) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Image file is required (req.file missing).");
	}

	const key = normalizeKey(body.key);

	const existing = await Item.findOne({ key });
	if (existing) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`Item key '${key}' already exists.`);
	}

	const uploaded = await uploadImageToCloudinary(req.file, {
		folder: CLOUDINARY_FOLDER,
		publicId: key,
		overwrite: false,
	});

	try {
		const item = await Item.create({
			key,
			name: body.name,
			description: body.description,

			image: {
				url: uploaded.url,
				publicId: uploaded.publicId,
			},

			flags: {
				stackable: !!body.flags?.stackable,
				consumable: !!body.flags?.consumable,
				equippable: !!body.flags?.equippable,
			},

			equip: body.equip?.slot ? { slot: body.equip.slot } : undefined,

			consumable: body.consumable,
			weapon: body.weapon,
			armour: body.armour,
			circulation: body.circulation,

			audit: {
				createdBy: {
					user: user._id,
					comments: body.comments || "No comments were made.",
				},
				updatedBy: [],
			},
		});

		res.status(StatusCodes.CREATED).json({ item });
	} catch (err) {
		// Roll back image if DB save fails
		try {
			await deleteFromCloudinary(uploaded.publicId);
		} catch (_) {}
		console.log(err);
	}
});

// @desc    Grabs all items
// route    GET /api/v1/item
// @access  Private --- Admin
const getAllItems = asyncHandler(async (req, res) => {
	const items = await Item.find({}).select("-__v").sort("key");
	res.status(StatusCodes.OK).json({ items });
});

// @desc    Updates an item and updates items in each inventory
// route    PUT /api/v1/item/:itemId
// @access  Private --- Super Admin
const updateItem = asyncHandler(async (req, res) => {
	const { itemId } = req.params;
	const item = await Item.findById(itemId);
	if (!item) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error(`No item found with id ${itemId}.`);
	}

	const userId = req.user?._id?.toString();
	const user = await User.findById(userId);
	if (!user) {
		res.status(StatusCodes.UNAUTHORIZED);
		throw new Error(`No user found with id ${userId}.`);
	}

	const body = parseBody(req.body);

	const errors = validateItemPayload(body, { isCreate: false });
	if (errors.length) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(errors.join(" "));
	}

	let newKey = item.key;
	if (body.key !== undefined) {
		newKey = normalizeKey(body.key);

		if (newKey !== item.key) {
			const keyTaken = await Item.findOne({ key: newKey });
			if (keyTaken) {
				res.status(StatusCodes.BAD_REQUEST);
				throw new Error(`Item key '${newKey}' already exists.`);
			}
		}
	}

	// This keeps “filename = key” even on key changes
	if (newKey !== item.key && !req.file && item.image?.publicId) {
		const oldPublicId = item.image.publicId;
		const newPublicId = `${CLOUDINARY_FOLDER}/${newKey}`;

		try {
			const renamed = await cloudinary.uploader.rename(
				oldPublicId,
				newPublicId,
				{ overwrite: true, resource_type: "image" }
			);

			item.image.url = renamed.secure_url;
			item.image.publicId = renamed.public_id;
		} catch (e) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR);
			throw new Error(
				"Failed to rename Cloudinary image to match the new key."
			);
		}
	}

	// If a new image file is provided, replace the cloudinary asset.
	// We delete the old one (optional) then upload using publicId = newKey (overwrite=true).
	if (req.file) {
		// If you want to be extra clean, delete old first (not strictly required if overwriting same publicId)
		if (
			item.image?.publicId &&
			item.image.publicId !== `${CLOUDINARY_FOLDER}/${newKey}`
		) {
			await destroyCloudinaryIfExists(item.image.publicId);
		}

		const uploaded = await uploadImageToCloudinary(req.file, {
			folder: CLOUDINARY_FOLDER,
			publicId: newKey,
			overwrite: true,
		});

		item.image.url = uploaded.url;
		item.image.publicId = uploaded.publicId;
	}

	// Apply scalar updates
	if (body.key !== undefined) item.key = newKey;
	if (body.name !== undefined) item.name = body.name;
	if (body.description !== undefined) item.description = body.description;

	// Apply flags/equip (only if provided)
	if (body.flags !== undefined) {
		item.flags = {
			...item.flags,
			...(body.flags.stackable !== undefined
				? { stackable: !!body.flags.stackable }
				: {}),
			...(body.flags.consumable !== undefined
				? { consumable: !!body.flags.consumable }
				: {}),
			...(body.flags.equippable !== undefined
				? { equippable: !!body.flags.equippable }
				: {}),
		};
	}
	if (body.equip !== undefined) {
		item.equip = {
			...item.equip,
			...(body.equip.slot !== undefined ? { slot: body.equip.slot } : {}),
		};
	}

	// Apply nested objects if provided
	if (body.consumable !== undefined) item.consumable = body.consumable;
	if (body.weapon !== undefined) item.weapon = body.weapon;
	if (body.armour !== undefined) item.armour = body.armour;
	if (body.circulation !== undefined) item.circulation = body.circulation;

	// Audit trail
	item.audit = item.audit || {};
	item.audit.updatedBy = item.audit.updatedBy || [];
	item.audit.updatedBy.push({
		user: user._id,
		date: new Date(),
		comments: body?.comments || "No comments were made.",
	});

	await item.save();

	res.status(StatusCodes.OK).json({
		msg: "Item updated.",
		item,
	});
});

// @desc    Deletes an item
// route    DELETE /api/v1/item/:itemId
// @access  Private --- Super Admin
const deleteItem = asyncHandler(async (req, res) => {
	const { itemId } = req.params;

	const EMPTY_SLOT = { item: null, quantity: 0 };

	await Inventory.updateMany(
		{ "slots.item": itemId },
		{
			$set: {
				"slots.$[s]": EMPTY_SLOT,
			},
		},
		{
			arrayFilters: [{ "s.item": itemId }],
		}
	);

	const characters = await Character.find({
		$or: EQUIP_SLOTS.map((slot) => ({
			[`equipment.${slot}.item`]: itemId,
		})),
	});

	for (const ch of characters) {
		let changed = false;

		for (const slot of EQUIP_SLOTS) {
			if (ch.equipment?.[slot]?.item?.toString() === itemId.toString()) {
				ch.equipment[slot] = EMPTY_SLOT;
				changed = true;
			}
		}

		if (changed) {
			await ch.save();
		}
	}

	const item = await Item.findByIdAndDelete(itemId);
	if (!item) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error(`No item found with id ${itemId}.`);
	}

	if (item.image?.publicId) {
		await deleteFromCloudinary(item.image?.publicId);
	}

	res.status(StatusCodes.OK).json({
		msg: "Item deleted",
		item,
	});
});

module.exports = { createItem, getAllItems, updateItem, deleteItem };
