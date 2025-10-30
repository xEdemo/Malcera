const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const ALLOWED_SKILLS = ["Attack", "Defense", "Strength", "Hitpoints"];

const SkillSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			enum: ALLOWED_SKILLS,
		},
		level: {
			type: Number,
			required: true,
			min: 1,
			default: 1,
		},
		xp: {
			type: Number,
			required: true,
			min: 0,
			default: 0,
		},
	},
	{ _id: false }
);

const uniqueSkillNames = (skills) => {
	const set = new Set(skills.map((s) => s.name));
	return set.size === skills.length;
};

const UserSchema = new mongoose.Schema(
	{
		account: {
			username: {
				type: String,
				required: [true, `Please provide your desired username.`],
				minlength: 3,
				maxlength: 16,
				match: [
					/^[A-Za-z0-9]+$/,
					`Please provide a valid username. Usernames must be atleast three characters, no longer than 16 characters, and must not contain any special characters`,
				],
				unique: false, //normalizedUsername
			},
			normalizedUsername: {
				type: String,
				unique: true,
				index: true,
				select: false, // hides it from query results
			},
			email: {
				type: String,
				required: [true, `Please provide a unique email address.`],
				unique: true,
				validate: {
					validator: validator.isEmail,
					message: "Please provide a valid email address",
				},
				minlength: 5,
				maxlength: 254,
			},
			password: {
				type: String,
				required: [true, "Please provide a password."],
				minlength: 8,
				maxlength: 60,
			},
			role: {
				type: String,
				enum: ["user", "playerMod", "forumMod", "admin", "superAdmin"],
				default: "user",
			},
		},

		flags: {
			banned: {
				type: Boolean,
				default: false,
			},
		},

		progress: {
			mobKills: { type: Number, default: 0, min: 0 },
			currency: {
				jossPaper: { type: Number, default: 0, min: 0 },
			},
		},

		skills: {
			type: [SkillSchema],
			validate: [
				{
					validator: uniqueSkillNames,
					message: "Duplicate skill names are not allowed per user.",
				},
			],
			default: () => [
				{ name: "Attack", level: 1, xp: 0 },
				{ name: "Defense", level: 1, xp: 0 },
				{ name: "Strength", level: 1, xp: 0 },
				{ name: "Hitpoints", level: 10, xp: 0 },
			],
		},

		gear: {
			weaponPower: { type: Number, default: 1, min: 0 },
			armourRating: { type: Number, default: 1, min: 0 },
		},

		world: {
			position: {
				type: {
					x: { type: Number },
					y: { type: Number },
				},
				default: { x: 7, y: 10 },
			},
			currentMap: {
				type: String,
				default: "tutorial",
			},
		},

		inventory: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Inventory",
		},
		character: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Character",
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

UserSchema.methods.getSkill = function (name) {
	return this.skills.find((s) => s.name === name);
};

// Health pool derived from Hitpoints level * 10
UserSchema.virtual("healthPool").get(function () {
	const hp = this.getSkill("Hitpoints");
	const hpLvl = hp?.level ?? 10;
	return hpLvl * 10;
});

UserSchema.virtual("combatLevel").get(function () {
	const atk = this.getSkill("Attack")?.level ?? 1;
	const def = this.getSkill("Defense")?.level ?? 1;
	const str = this.getSkill("Strength")?.level ?? 1;
	const hp = this.getSkill("Hitpoints")?.level ?? 10;
	return (atk + def + str + hp) / 4;
});

// UserSchema.virtual("modAttackLevel").get(function () {
// 	const atk = this.getSkill("Attack")?.level ?? 1;
// 	const weaponPower = this.gear?.weaponPower ?? 1;
// 	const modAttack = weaponPower / 2 / 50;
// 	return atk + modAttack;
// });

// UserSchema.virtual("modStrengthLevel").get(function () {
// 	const str = this.getSkill("Strength")?.level ?? 1;
// 	const weaponPower = this.gear?.weaponPower ?? 1;
// 	const modStrength = weaponPower / 2 / 50;
// 	return str + modStrength;
// });

// UserSchema.virtual("modDefenseLevel").get(function () {
// 	const def = this.getSkill("Defense")?.level ?? 1;
// 	const armourRating = this.gear?.armourRating ?? 1;
// 	const modDefense = armourRating / 50;
// 	return def + modDefense;
// });

// UserSchema.pre("save", async function (next) {
// 	if (!this.isModified("password") || this.isPasswordHashed) {
// 		return next();
// 	}
// 	const salt = await bcrypt.genSalt(10);
// 	this.password = await bcrypt.hash(this.password, salt);
// 	this.isPasswordHashed = true;
// 	next();
// });

UserSchema.pre("save", function normalizeNames(next) {
	if (this.account?.username) {
		// keep original as typed
		const typed = this.account.username.trim();
		this.account.username = typed;

		// store normalized (lowercase) for uniqueness/lookups
		this.account.normalizedUsername = typed.toLowerCase();
	}

	if (this.account?.email) {
		this.account.email = this.account.email.trim().toLowerCase();
	}

	next();
});

// Hash password if changed and not already hashed
UserSchema.pre("save", async function hashPassword(next) {
	const pwdPath = "account.password";
	if (!this.isModified(pwdPath)) return next();

	// Heuristic: bcrypt hashes usually start with $2a/$2b/$2y and are ~60 chars
	const current = this.account.password || "";
	const looksHashed = typeof current === "string" && current.startsWith("$2");
	if (looksHashed) return next();

	const salt = await bcrypt.genSalt(10);
	this.account.password = await bcrypt.hash(this.account.password, salt);
	next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.account.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
