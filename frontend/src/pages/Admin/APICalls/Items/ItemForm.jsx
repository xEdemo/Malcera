import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { ImageUploadField } from "../../../../components/Admin/FormFields/AdminFormFields.jsx";
import {
	DAMAGE_TYPES,
	EQUIP_SLOTS,
	buildItemDefaultValues,
} from "./ItemFormDefaults.js";
import { createItem, updateItem } from "../../../../slices/item/itemSlice.js";
import { slugifyKey, toNumberOrNull } from "../../../../utils/formUtils.js";
import { toast } from "react-toastify";

const ItemForm = ({ mode = "post" }) => {
	const { itemId } = useParams();

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { items } = useSelector((state) => state.item);

	const initialItem = useMemo(() => {
		if (mode !== "put") return null;
		return items ? items.find((i) => i._id === itemId) : null;
	}, [mode, items, itemId]);

	const ammoItems = useMemo(() => {
		if (!items) return [];
		// filter ammo by equip.slot === "ammo" (adjust if your schema differs)
		return items.filter((i) => i?.equip?.slot === "ammo");
	}, [items]);

	const defaultValues = useMemo(
		() => buildItemDefaultValues(initialItem),
		[initialItem]
	);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues,
		mode: "onBlur",
	});

	const flags = watch("flags");
	const consumableEnabled = !!flags?.consumable;
	const equippableEnabled = !!flags?.equippable;

	// existing image preview for edit mode
	const existingImageUrl = initialItem?.image?.url ?? "";

	// You might want separate "type" selection later (weapon vs armour vs ammo).
	// For now, show sections when equippable and user fills them in.
	const weaponDamageType = watch("weapon.damage.type");
	const armourRating = watch("armour.rating");

	const onSubmit = async (values) => {
		try {
			const formData = new FormData();

			// Clone & clean before sending
			const payload = structuredClone(values);

			// imageFile is frontend-only
			const file = payload.imageFile?.[0] ?? null;
			delete payload.imageFile;

			payload.key = slugifyKey(payload.key);

			formData.append("key", JSON.stringify(payload.key));
			formData.append("name", JSON.stringify(payload.name));
			formData.append("description", JSON.stringify(payload.description));
			formData.append("flags", JSON.stringify(payload.flags));
			if (payload?.equip) {
				formData.append("equip", JSON.stringify(payload.equip));
			}
			if (payload?.consumable) {
				formData.append(
					"consumable",
					JSON.stringify(payload.consumable)
				);
			}
			if (payload?.weapon) {
				formData.append("weapon", JSON.stringify(payload.weapon));
			}
			if (payload?.armour) {
				formData.append("armour", JSON.stringify(payload.armour));
			}
			if (payload?.circulation) {
				formData.append(
					"circulation",
					JSON.stringify(payload.circulation)
				);
			}
			if (payload?.comments) {
				formData.append("comments", JSON.stringify(payload.comments));
			}

			if (file) {
				formData.append("image", file);
			}

			if (mode === "post") {
				await dispatch(createItem(formData)).unwrap();
				toast.success("Item created successfully.");
			} else {
				await dispatch(updateItem({ itemId, data: formData })).unwrap();
				toast.success("Item updated successfully.");
			}

			navigate("/admin/item");
		} catch (err) {
			toast.error(err?.message || "Failed to save item.");
		}
	};

	return (
		<form className="admin-form" onSubmit={handleSubmit(onSubmit)}>
			<h2>{mode === "post" ? "Create Item" : "Edit Item"}</h2>
			{/* KEY */}
			<div className="form-field">
				<label className="form-label">Key</label>
				<input
					className="form-input"
					type="text"
					// disabled={mode === "put"}
					{...register("key", {
						required: "Key is required",
						minLength: { value: 2, message: "Key is too short" },
						pattern: {
							value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
							message:
								"Use lowercase letters/numbers with dashes (no spaces).",
						},
						onBlur: (e) => {
							const slug = slugifyKey(e.target.value);
							setValue("key", slug, { shouldValidate: true });
						},
					})}
					placeholder="iron-sword-01"
				/>
				{errors.key?.message ? (
					<div className="form-error">{errors.key.message}</div>
				) : null}
			</div>

			{/* NAME */}
			<div className="form-field">
				<label className="form-label">Name</label>
				<input
					className="form-input"
					type="text"
					{...register("name", { required: "Name is required" })}
				/>
				{errors.name?.message ? (
					<div className="form-error">{errors.name.message}</div>
				) : null}
			</div>

			{/* DESCRIPTION */}
			<div className="form-field">
				<label className="form-label">Description</label>
				<textarea
					className="form-textarea"
					rows={4}
					{...register("description", {
						required: "Description is required",
					})}
				/>
				{errors.description?.message ? (
					<div className="form-error">
						{errors.description.message}
					</div>
				) : null}
			</div>

			{/* IMAGE UPLOAD + PREVIEW */}
			<ImageUploadField
				label="Item Image"
				register={register}
				watch={watch}
				setValue={setValue}
				existingUrl={existingImageUrl}
			/>

			{/* FLAGS */}
			<div className="admin-form-flags">
				<label className="form-checkbox">
					<input type="checkbox" {...register("flags.stackable")} />
					<span>Stackable</span>
				</label>
				<label className="form-checkbox">
					<input type="checkbox" {...register("flags.consumable")} />
					<span>Consumable</span>
				</label>
				<label className="form-checkbox">
					<input type="checkbox" {...register("flags.equippable")} />
					<span>Equippable</span>
				</label>
			</div>

			{/* EQUIP SECTION (always visible, disabled when not enabled) */}
			<fieldset className="form-section" disabled={!equippableEnabled}>
				<legend>Equip</legend>

				<div
					className={`section-disabled-hint ${
						equippableEnabled ? "hidden" : ""
					}`}
				>
					Enable <strong>Equippable</strong> to edit equip fields.
				</div>

				<div className="form-field">
					<label className="form-label">Equip Slot</label>
					<select
						className="form-select"
						{...register("equip.slot", {
							validate: (val) => {
								if (!equippableEnabled) return true;
								return val
									? true
									: "Equip slot is required when equippable.";
							},
						})}
					>
						<option value="">Select...</option>
						{EQUIP_SLOTS.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					{errors.equip?.slot?.message ? (
						<div className="form-error">
							{errors.equip.slot.message}
						</div>
					) : null}
				</div>

				<h4>Weapon</h4>
				<div className="form-field">
					<label className="form-label">Damage Type</label>
					<select
						className="form-select"
						{...register("weapon.damage.type")}
					>
						<option value="">(optional)</option>
						{DAMAGE_TYPES.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>

				<div className="form-field">
					<label className="form-label">Damage Low</label>
					<input
						className="form-input"
						type="number"
						min="0"
						{...register("weapon.damage.damageLow", {
							setValueAs: toNumberOrNull,
							min: { value: 0, message: "Cannot be negative." },
						})}
					/>
				</div>

				<div className="form-field">
					<label className="form-label">Damage High</label>
					<input
						className="form-input"
						type="number"
						min="0"
						{...register("weapon.damage.damageHigh", {
							setValueAs: toNumberOrNull,
							min: { value: 0, message: "Cannot be negative." },
							validate: (val) => {
								const low = watch("weapon.damage.damageLow");
								if (val == null || low == null) return true;
								return val >= low
									? true
									: "Damage High must be >= Damage Low.";
							},
						})}
					/>
					{errors.weapon?.damage?.damageHigh?.message ? (
						<div className="form-error">
							{errors.weapon.damage.damageHigh.message}
						</div>
					) : null}
				</div>

				<div className="form-field">
					<label className="form-label">Accuracy</label>
					<input
						className="form-input"
						type="number"
						min="0"
						{...register("weapon.accuracy", {
							setValueAs: toNumberOrNull,
							min: { value: 0, message: "Cannot be negative." },
						})}
					/>
				</div>

				<div className="form-field">
					<label className="form-label">
						Usable Ammunition Items
					</label>
					<select
						className="form-select"
						multiple
						value={watch("weapon.ammunition.usable")}
						onChange={(e) => {
							const selected = Array.from(
								e.target.selectedOptions
							).map((o) => o.value);
							setValue("weapon.ammunition.usable", selected, {
								shouldValidate: true,
							});
						}}
					>
						{ammoItems.map((it) => (
							<option key={it._id} value={it._id}>
								{it.name} ({it.key})
							</option>
						))}
					</select>
					<small className="form-hint">
						Filtered by equip.slot === "ammo".
					</small>
				</div>

				<h4>Armour</h4>
				<div className="form-field">
					<label className="form-label">Armour Rating</label>
					<input
						className="form-input"
						type="number"
						min="0"
						{...register("armour.rating", {
							setValueAs: toNumberOrNull,
							min: { value: 0, message: "Cannot be negative." },
						})}
					/>
				</div>
			</fieldset>

			{/* CONSUMABLE SECTION (always visible, disabled when not enabled) */}
			<fieldset
				className="form-section"
				disabled={!consumableEnabled}
			>
				<legend>Consumable</legend>

				<div
					className={`section-disabled-hint ${
						consumableEnabled ? "hidden" : ""
					}`}
				>
					Enable <strong>Consumable</strong> to edit consumable
					fields.
				</div>

				<div className="form-field">
					<label className="form-label">Heal Amount</label>
					<input
						className="form-input"
						type="number"
						min="0"
						{...register("consumable.healAmount", {
							setValueAs: toNumberOrNull,
							min: { value: 0, message: "Cannot be negative." },
						})}
					/>
				</div>
			</fieldset>

			<div className="form-field">
				<label className="form-label">
					{mode === "post" ? "Creation Comment" : "Update Comment"}
				</label>
				<textarea
					className="form-textarea"
					rows={2}
					{...register("comments")}
				/>
			</div>

			<button
				className="form-button"
				type="submit"
				disabled={isSubmitting}
			>
				{mode === "post" ? "Create Item" : "Save Changes"}
			</button>
		</form>
	);
};

export default ItemForm;
