/*
bits  0..10  : v (11 bits)
bits 11..18  : yEnc (8 bits)  where yEnc = y + 50   => 0..250
bit      19  : walkable (w)
bit      20  : portal   (p)
*/

const V_BITS = 11;
const Y_BITS = 8;

const V_MASK = (1 << V_BITS) - 1; // 0x7FF
const Y_MASK = (1 << Y_BITS) - 1; // 0xFF

const Y_MIN = -50;
const Y_MAX = 200;
const Y_BIAS = -Y_MIN; // 50

// bit positions
const V_SHIFT = 0;
const Y_SHIFT = 11;
const W_SHIFT = 19;
const P_SHIFT = 20;

const packTile = ({ v = 1, y = 0, w = true, p = false }) => {
	if (v < 0 || v > 2000) throw new Error(`v out of range (0..2000): ${v}`);
	if (y < Y_MIN || y > Y_MAX)
		throw new Error(`y out of range (${Y_MIN}..${Y_MAX}): ${y}`);

	const yEnc = y + Y_BIAS; // 0..250

	let n = 0;
	n |= v & 0x7ff; // 11 bits
	n |= (yEnc & Y_MASK) << Y_SHIFT;
	if (w) n |= 1 << W_SHIFT;
	if (p) n |= 1 << P_SHIFT;

	// Ensure unsigned 32-bit
	return n >>> 0;
};

const unpackTile = (n) => {
	n = n >>> 0;

	const v = (n >>> V_SHIFT) & V_MASK;
	const yEnc = (n >>> Y_SHIFT) & Y_MASK;
	const y = yEnc - Y_BIAS;

	const w = ((n >>> W_SHIFT) & 1) === 1;
	const p = ((n >>> P_SHIFT) & 1) === 1;

	return { v, y, w, p };
};

module.exports = {
	packTile,
	unpackTile,
};
