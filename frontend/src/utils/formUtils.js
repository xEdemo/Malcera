export function slugifyKey(value = "") {
	return value
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // spaces -> dashes
		.replace(/[^a-z0-9-]/g, "") // keep a-z, 0-9, -
		.replace(/-+/g, "-") // collapse multiple dashes
		.replace(/^-|-$/g, ""); // trim leading/trailing dash
}

// RHF: turn "" into null, otherwise Number(val)
export function toNumberOrNull(val) {
	if (val === "" || val === null || val === undefined) return null;
	const n = Number(val);
	return Number.isFinite(n) ? n : null;
}
