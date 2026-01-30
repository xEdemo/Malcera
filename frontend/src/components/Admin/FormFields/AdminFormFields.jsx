import { useEffect, useMemo, useState } from "react";

export const ImageUploadField = ({
	label,
	register,
	watch,
	setValue,
	existingUrl,
}) => {
	const fileList = watch("imageFile"); // FileList from input
	const file = fileList?.[0] ?? null;

	const [localPreview, setLocalPreview] = useState(null);

	useEffect(() => {
		if (!file) {
			setLocalPreview(null);
			return;
		}
		const url = URL.createObjectURL(file);
		setLocalPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

	const previewSrc = localPreview || existingUrl || "";

	return (
		<div className="form-field">
			<label className="form-label">{label}</label>

			{previewSrc ? (
				<img
					src={previewSrc}
					alt="Item preview"
					className="item-image-preview"
					loading="lazy"
				/>
			) : (
				<div className="item-image-preview placeholder">
					No image selected
				</div>
			)}

			<input
				className="form-input"
				type="file"
				accept="image/*"
				{...register("imageFile")}
			/>

			{/* Optional: clear new selection */}
			{file ? (
				<button
					type="button"
					className="form-button-secondary"
					onClick={() => setValue("imageFile", null)}
				>
					Clear selected image
				</button>
			) : null}
		</div>
	);
};
