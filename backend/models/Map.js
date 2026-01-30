const mongoose = require("mongoose");

const PointLightSchema = new mongoose.Schema(
	{
		position: {
			x: { type: Number, default: 0 },
			y: { type: Number, default: 0 },
			z: { type: Number, default: 0 },
		},
		color: { type: String, default: "#ffffff" },
		intensity: { type: Number, default: 1 },
		distance: { type: Number, default: 0 },
		decay: { type: Number, default: 2 },
	},
	{ _id: false }
);

const PortalSchema = new mongoose.Schema(
	{
		from: {
			x: { type: Number, required: true, min: 0 },
			z: { type: Number, required: true, min: 0 },
		},
		to: {
			key: { type: String, required: true },
			x: { type: Number, required: true, min: 0 },
			z: { type: Number, required: true, min: 0 },
		},
	},
	{ _id: false }
);

const AssetSchema = new mongoose.Schema(
	{
		path: { type: String, required: true }, // asset key
		position: {
			x: { type: Number, default: 0 },
			z: { type: Number, default: 0 },
		},
		positionOffset: {
			x: { type: Number, default: 0 },
			y: { type: Number, default: 0 },
			z: { type: Number, default: 0 },
		},
		rotation: {
			x: { type: Number, default: 0 },
			y: { type: Number, default: 0 },
			z: { type: Number, default: 0 },
		},
		scale: {
			x: { type: Number, default: 1 },
			y: { type: Number, default: 1 },
			z: { type: Number, default: 1 },
		},
		f: {
			w: { type: Boolean, default: false },
		},
	},
	{ _id: false }
);

const MapSchema = new mongoose.Schema(
	{
		key: { type: String, required: true, unique: true, index: true },
		width: { type: Number, required: true, min: 1 },
		height: { type: Number, required: true, min: 1 },

		skybox: {
			key: { type: String },
			rotationY: { type: Number, default: 0 },
			intensity: { type: Number, default: 1 },
		},

		lighting: {
			ambient: {
				intensity: { type: Number, default: 0.9 },
				color: { type: String, default: "#ffffff" },
			},
			directional: {
				position: {
					x: { type: Number, default: 10 },
					y: { type: Number, default: 10 },
					z: { type: Number, default: 10 },
				},
				intensity: { type: Number, default: 5 },
				color: { type: String, default: "#ffffff" },
			},
			point: { type: [PointLightSchema], default: [] },
		},

		tiles: { type: Buffer, required: true },

		portals: { type: [PortalSchema], default: [] },

		assets: { type: [AssetSchema], default: [] },

		audit: {
			createdBy: {
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				comments: { type: String },
			},
			updatedBy: [
				{
					user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
					date: { type: Date },
					comments: { type: String },
				},
			],
		},
	},
	{ timestamps: true }
);

const Map = mongoose.model("Map", MapSchema);

module.exports = Map;
