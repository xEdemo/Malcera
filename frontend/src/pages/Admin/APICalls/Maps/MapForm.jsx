import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { buildMapDefaultValues } from "./mapFormDefaults.js";
import { createMap } from "../../../../slices/map/mapSlice.js";
import { slugifyKey, toNumberOrNull } from "../../../../utils/formUtils.js";
import { toast } from "react-toastify";

const MapForm = ({ mode = "post" }) => {
	const { mapId } = useParams();

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { maps } = useSelector((state) => state.map);

	const initialMap = useMemo(() => {
		if (mode !== "put") return null;
		return maps ? maps.find((i) => i._id === mapId) : null;
	}, [mode, maps, mapId]);

	const defaultValues = useMemo(
		() => buildMapDefaultValues(initialMap),
		[initialMap]
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

	const onSubmit = async (values) => {
		try {
			if (mode === "post") {
				await dispatch(createMap(values)).unwrap();
				toast.success("Map created successfully.");
			} else {
				// await dispatch(updateMap({ mapId, data: values })).unwrap();
				// toast.success("Map updated successfully.");
			}
			navigate("/admin/map");
		} catch (err) {
			toast.error(err?.message || "Failed to save map.");
		}
	};

	return (
		<form className="admin-form" onSubmit={handleSubmit(onSubmit)}>
			<h2>{mode === "post" ? "Create Map" : "Edit Map"}</h2>
			<div className="form-field">
				<label className="form-label">Key</label>
				<input
					className="form-input"
					type="text"
					// disabled={mode === "put"}
					{...register("key", {
						required: "Key is required",
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
					placeholder="brutal-caverns-01"
				/>
				{errors.key?.message ? (
					<div className="form-error">{errors.key.message}</div>
				) : null}
			</div>

			{/* DIMENSIONS */}
			<div className="form-field">
				<label className="form-label">Width</label>
				<input
					className="form-input"
					type="number"
					min="0"
					{...register("width", {
						required: "Width is required",
						setValueAs: toNumberOrNull,
						min: { value: 0, message: "Width cannot be negative." },
					})}
				/>
				{errors.width?.message ? (
					<div className="form-error">{errors.width.message}</div>
				) : null}
			</div>
			<div className="form-field">
				<label className="form-label">Height</label>
				<input
					className="form-input"
					type="number"
					min="0"
					{...register("height", {
						required: "Height is required",
						setValueAs: toNumberOrNull,
						min: {
							value: 0,
							message: "Height cannot be negative.",
						},
					})}
				/>
				{errors.height?.message ? (
					<div className="form-error">{errors.height.message}</div>
				) : null}
			</div>

			{/* AUDIT */}
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
				{mode === "post" ? "Create Map" : "Save Changes"}
			</button>
		</form>
	);
};

export default MapForm;
