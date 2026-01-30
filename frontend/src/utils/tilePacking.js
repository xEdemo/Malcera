// src/utils/tilePacking.js

// Must match your server packing layout:
// bits  0..10: v (0..2047)
// bits 11..18: yEnc (0..255) where y = yEnc - 50
// bit 19: w
// bit 20: p

const V_MASK = 0x7ff; // 11 bits
const Y_MASK = 0xff;  // 8 bits

const Y_SHIFT = 11;
const W_SHIFT = 19;
const P_SHIFT = 20;

const Y_BIAS = 50; // y = yEnc - 50

export function unpackV(packed) {
  return (packed >>> 0) & V_MASK;
}

export function unpackY(packed) {
  const yEnc = ((packed >>> Y_SHIFT) & Y_MASK);
  return (yEnc - Y_BIAS) | 0;
}

export function unpackW(packed) {
  return (((packed >>> W_SHIFT) & 1) === 1);
}

export function unpackP(packed) {
  return (((packed >>> P_SHIFT) & 1) === 1);
}

// Decode base64 -> Uint32Array (little-endian safe in JS TypedArray land)
export function base64ToUint32Array(base64) {
  // base64 may come as { $binary: { base64: "...", subType:"00" } } depending on your API
  // so ensure you pass the actual string.
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  if (bytes.byteLength % 4 !== 0) {
    throw new Error(`Invalid tiles buffer length: ${bytes.byteLength} (not divisible by 4)`);
  }
  return new Uint32Array(bytes.buffer);
}