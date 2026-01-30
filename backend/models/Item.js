const mongoose = require("mongoose");
const { EQUIP_SLOTS } = require("../utils/enum.js");

const ItemSchema = new mongoose.Schema(
	{
		key: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},

		image: {
			url: {
				type: String,
				required: true,
			},
			publicId: {
				type: String,
				required: true,
			},
		},

		flags: {
			stackable: {
				type: Boolean,
				default: false,
			},
			consumable: {
				type: Boolean,
				default: false,
			},
			equippable: {
				type: Boolean,
				default: false,
			},
		},

		equip: {
			slot: {
				type: String,
				enum: EQUIP_SLOTS,
			},
		},

		consumable: {
			healAmount: {
				type: Number,
			},
			// later: buffs, duration, etc.
		},

		weapon: {
			damage: {
				type: {
					type: String,
					enum: ["crushing", "stabbing", "piercing", "slashing"],
				},
				damageLow: {
					type: Number,
					min: 1,
				},
				damageHigh: {
					type: Number,
					min: 1,
				},
			},
			accuracy: {
				type: Number,
				min: [0, "Cannot have negative accuracy."],
			},
			ammunition: {
				usable: {
					type: [mongoose.Schema.Types.ObjectId],
					ref: "Item",
				},
			},
		},

		armour: {
			rating: {
				type: Number,
				min: 1,
			},
		},

		circulation: {
			total: {
				type: Number,
			},
			hourlyChange: {
				type: Number,
			},
			dailyChange: {
				type: Number,
			},
			monthlyChange: {
				type: Number,
			},
			yearlyChange: {
				type: Number,
			},
		},

		audit: {
			createdBy: {
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				comments: {
					type: String,
				},
			},
			updatedBy: [
				{
					user: {
						type: mongoose.Schema.Types.ObjectId,
						ref: "User",
					},
					date: {
						type: Date,
					},
					comments: {
						type: String,
					},
					_id: false,
				},
			],
		},
	},
	{ timestamps: true }
);

ItemSchema.pre("validate", function (next) {
	const slot = this.equip?.slot;
	if (!slot) return next();

	if (!this.flags?.equippable) {
		return next(
			new Error("equip.slot is set but item flag is not equippable.")
		);
	}

	next();
});

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
