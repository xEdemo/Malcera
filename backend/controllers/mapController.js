const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const { User, Map } = require("../models");
const { packTile } = require("../utils");

// ---------------- helpers ----------------
const normalizeKey = (key) => key.trim().toLowerCase().replace(/\s+/g, "-");

// ---------------- controllers ----------------

// @desc    Creates a map
// route    POST /api/v1/map
// @access  Private --- Super Admin
const createMap = asyncHandler(async (req, res) => {
	const userId = req.user?._id?.toString();
	const user = await User.findById(userId);
	if (!user) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`No user found with id ${userId}.`);
	}

	const body = req.body;

	const key = typeof body.key === "string" ? normalizeKey(body.key) : "";

	if (!key) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("Map key is required.");
	}

	const width = Number(body.width);
	const height = Number(body.height);

	if (!Number.isInteger(width) || width < 1) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("width must be an integer >= 1.");
	}
	if (!Number.isInteger(height) || height < 1) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error("height must be an integer >= 1.");
	}

	const existing = await Map.findOne({ key });
	if (existing) {
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(`Map key '${key}' already exists.`);
	}

	// ---- generate default tiles ----
	const tileCount = width * height;

	const defaultPacked = packTile({
		v: 1,
		y: 0,
		w: true,
		p: false,
	});

	const tilesArray = new Uint32Array(tileCount);
	tilesArray.fill(defaultPacked);

	const tilesBuffer = Buffer.from(tilesArray.buffer);

	try {
		const map = await Map.create({
			key,
			width,
			height,
			tiles: tilesBuffer,
			portals: [],
			assets: [],
			audit: {
				createdBy: {
					user: user._id,
					comments: body.comments || "No comments were made.",
				},
				updatedBy: [],
			},
		});

		res.status(StatusCodes.CREATED).json({
			map: {
				_id: map._id,
				key: map.key,
				width: map.width,
				height: map.height,
				skybox: map.skybox,
				lighting: map.lighting,
				portals: map.portals,
				assets: map.assets,
			},
		});
	} catch (err) {
		// This will tell you EXACTLY what field is failing validation
		console.log("Map.create error:", err);
		res.status(StatusCodes.BAD_REQUEST);
		throw new Error(err.message);
	}
});

// @desc    Grabs all maps (metadata only - no tiles)
// route    GET /api/v1/map
// @access  Private --- Admin
const getAllMaps = asyncHandler(async (req, res) => {
	const maps = await Map.find({})
		.select("-__v -tiles") // exclude big buffer
		.sort("key");

	res.status(StatusCodes.OK).json({ maps });
});

// @desc    Grabs single map (includes tilesBase64)
// route    GET /api/v1/map/:key
// @access  Public --- Protected
const getMapByKey = asyncHandler(async (req, res) => {
	const key = (req.params.key || "").trim().toLowerCase();

	const map = await Map.findOne({ key }).select("-__v");
	if (!map) {
		res.status(StatusCodes.NOT_FOUND);
		throw new Error(`Map '${key}' not found.`);
	}

	// Convert Buffer -> base64 for frontend decode
	const tilesBase64 = map.tiles?.toString("base64") || "";

	res.status(StatusCodes.OK).json({
		map: {
			_id: map._id,
			key: map.key,
			width: map.width,
			height: map.height,
			skybox: map.skybox,
			lighting: map.lighting,
			portals: map.portals,
			assets: map.assets,
			tilesBase64,
		},
	});
});

module.exports = { createMap, getAllMaps, getMapByKey };
