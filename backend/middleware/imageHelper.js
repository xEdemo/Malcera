const cloudinary = require("../config/cloudinary.js");

/**
 * Uploads an image to Cloudinary.
 * @param {Object} file - multer file (memoryStorage)
 * @param {Object} opts
 * @param {String} opts.folder - cloudinary folder
 * @param {String} opts.publicId - desired public_id (e.g. item key)
 * @param {Boolean} opts.overwrite - overwrite existing asset with same public_id
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadImageToCloudinary = async (
	file,
	{ folder = "general", publicId, overwrite = true } = {}
) => {
	return new Promise((resolve, reject) => {
		if (!file || !file.buffer) {
			return reject(new Error("File buffer is missing"));
		}

		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder,
				public_id: publicId, // <-- key goes here
				overwrite,
				resource_type: "image",
				format: "webp",
				allowed_formats: ["jpg", "jpeg", "png", "webp"],
			},
			(error, result) => {
				if (error) return reject(error);

				resolve({
					url: result.secure_url,
					publicId: result.public_id, // includes folder path
				});
			}
		);

		uploadStream.end(file.buffer);
	});
};

const deleteFromCloudinary = async (publicId) => {
	if (!publicId) return;
	await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

const renameCloudinaryPublicId = async (fromPublicId, toPublicId) => {
	if (!fromPublicId || !toPublicId || fromPublicId === toPublicId)
		return null;
	return cloudinary.uploader.rename(fromPublicId, toPublicId, {
		overwrite: true,
		invalidate: true,
	});
};

module.exports = {
	uploadImageToCloudinary,
	deleteFromCloudinary,
	renameCloudinaryPublicId,
};
