export const DAMAGE_TYPES = ["crushing", "stabbing", "piercing", "slashing"];

export const EQUIP_SLOTS = [
	"ammo",
	"mantle",
	"weaponRight",
	"weaponLeft",
	"handJewelryRight",
	"handJewelryLeft",
	"helmet",
	"neck",
	"chest",
	"greaves",
	"boots",
	"gauntlets",
];

export const buildItemDefaultValues = (item) => {
	return {
		key: item?.key ?? "",
		name: item?.name ?? "",
		description: item?.description ?? "",

		imageFile: null,

		flags: {
			stackable: item?.flags?.stackable ?? false,
			consumable: item?.flags?.consumable ?? false,
			equippable: item?.flags?.equippable ?? false,
		},

		equip: {
			slot: item?.equip?.slot ?? "", // only required when equippable
		},

		consumable: {
			healAmount: item?.consumable?.healAmount ?? null,
		},

		weapon: {
			damage: {
				type: item?.weapon?.damage?.type ?? "",
				damageLow: item?.weapon?.damage?.damageLow ?? null,
				damageHigh: item?.weapon?.damage?.damageHigh ?? null,
			},
			accuracy: item?.weapon?.accuracy ?? null,
			ammunition: {
				usable: item?.weapon?.ammunition?.usable ?? [], // array of itemIds
			},
		},

		circulation: {
			total: null,
			hourlyChange: null,
			dailyChange: null,
			monthlyChange: null,
			yearlyChange: null,
		},

		armour: {
			rating: item?.armour?.rating ?? null,
		},

		comments: "",
	};
};
