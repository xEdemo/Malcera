import * as THREE from "three";
import { useMemo, useRef, useCallback, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import { unpackV, unpackY } from "../../utils/tilePacking";

// Map tile.v -> base weights (before smoothing)
function vToWeights(v) {
	switch (v) {
		case 1:
			return [1, 0, 0, 0]; // grass
		case 4:
			return [0, 1, 0, 0]; // dirt/gravel
		case 3:
			return [0, 0, 1, 0]; // rock
		case 2:
			return [0, 0, 0, 1]; // water
		default:
			return [0, 0, 1, 0]; // rock as default
	}
}

function blendedWeights(getPacked, rows, cols, r, c) {
	const kernel = [
		{ dr: 0, dc: 0, w: 4 },
		{ dr: 1, dc: 0, w: 1 },
		{ dr: -1, dc: 0, w: 1 },
		{ dr: 0, dc: 1, w: 1 },
		{ dr: 0, dc: -1, w: 1 },
		{ dr: 1, dc: 1, w: 0.5 },
		{ dr: 1, dc: -1, w: 0.5 },
		{ dr: -1, dc: 1, w: 0.5 },
		{ dr: -1, dc: -1, w: 0.5 },
	];

	let g = 0,
		d = 0,
		ro = 0,
		wa = 0;
	let total = 0;

	for (const k of kernel) {
		const rr = r + k.dr;
		const cc = c + k.dc;
		if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;

		const packed = getPacked(rr, cc);
		const v = unpackV(packed);
		if (v <= 0) continue;

		const [bg, bd, bro, bwa] = vToWeights(v);
		g += bg * k.w;
		d += bd * k.w;
		ro += bro * k.w;
		wa += bwa * k.w;
		total += k.w;
	}

	if (total <= 0) return [0, 0, 0, 0];

	g /= total;
	d /= total;
	ro /= total;
	wa /= total;

	// optional: make water “win” harder
	wa = Math.min(1, wa * 2.5);

	const sum = g + d + ro + wa;
	return sum > 0 ? [g / sum, d / sum, ro / sum, wa / sum] : [0, 0, 0, 0];
}

const Terrain = ({ width, height, tilesU32, tileSize = 1, uvScale = 2.5 }) => {
	const meshRef = useRef();

	const [tGrass, tDirt, tRock, tWater] = useTexture([
		"/src/assets/textures/tutorial/grass.jpg",
		"/src/assets/textures/tutorial/dirt.jpg",
		"/src/assets/textures/tutorial/rock.jpg",
		"/src/assets/textures/tutorial/water.jpg",
	]);

	// Configure textures
	useMemo(() => {
		for (const t of [tGrass, tDirt, tRock, tWater]) {
			if (!t) continue;
			t.wrapS = t.wrapT = THREE.RepeatWrapping;
			t.colorSpace = THREE.SRGBColorSpace;
			t.anisotropy = 8;
		}
	}, [tGrass, tDirt, tRock, tWater]);

	const geometry = useMemo(() => {
		const rows = height;
		const cols = width;

		const getPacked = (r, c) => tilesU32[r * cols + c] >>> 0;

		const vRows = rows + 1;
		const vCols = cols + 1;
		const vertexCount = vRows * vCols;

		const positions = new Float32Array(vertexCount * 3);
		const uvs = new Float32Array(vertexCount * 2);
		const weights = new Float32Array(vertexCount * 4);

		const indexCount = rows * cols * 6;
		const indices = new Uint32Array(indexCount);

		const getY = (r, c) => unpackY(getPacked(r, c));

		const cornerHeight = (r, c) => {
			// average y from the 4 tiles touching this corner (clamped)
			const samples = [];

			const t1r = r - 1,
				t1c = c - 1;
			const t2r = r - 1,
				t2c = c;
			const t3r = r,
				t3c = c - 1;
			const t4r = r,
				t4c = c;

			if (t1r >= 0 && t1r < rows && t1c >= 0 && t1c < cols)
				samples.push(getY(t1r, t1c));
			if (t2r >= 0 && t2r < rows && t2c >= 0 && t2c < cols)
				samples.push(getY(t2r, t2c));
			if (t3r >= 0 && t3r < rows && t3c >= 0 && t3c < cols)
				samples.push(getY(t3r, t3c));
			if (t4r >= 0 && t4r < rows && t4c >= 0 && t4c < cols)
				samples.push(getY(t4r, t4c));

			if (!samples.length) return 0;
			const sum = samples.reduce((a, b) => a + b, 0);
			return sum / samples.length;
		};

		const cornerWeights = (r, c) => {
			// pick a representative in-bounds tile for weights near this corner
			const tr = Math.min(
				rows - 1,
				Math.max(0, r === rows ? rows - 1 : r)
			);
			const tc = Math.min(
				cols - 1,
				Math.max(0, c === cols ? cols - 1 : c)
			);
			return blendedWeights(getPacked, rows, cols, tr, tc);
		};

		let vIndex = 0;
		for (let r = 0; r < vRows; r++) {
			for (let c = 0; c < vCols; c++) {
				// corner world coords
				const x = c * tileSize;
				const z = r * tileSize;

				const y = cornerHeight(r, c);

				positions[vIndex * 3 + 0] = x;
				positions[vIndex * 3 + 1] = y;
				positions[vIndex * 3 + 2] = z;

				uvs[vIndex * 2 + 0] = x / uvScale;
				uvs[vIndex * 2 + 1] = z / uvScale;

				const [wg, wd, wr, ww] = cornerWeights(r, c);
				weights[vIndex * 4 + 0] = wg;
				weights[vIndex * 4 + 1] = wd;
				weights[vIndex * 4 + 2] = wr;
				weights[vIndex * 4 + 3] = ww;

				vIndex++;
			}
		}

		const vert = (r, c) => r * vCols + c;

		let idx = 0;
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const a = vert(r, c);
				const b = vert(r, c + 1);
				const d = vert(r + 1, c);
				const e = vert(r + 1, c + 1);

				indices[idx++] = a;
				indices[idx++] = d;
				indices[idx++] = b;

				indices[idx++] = b;
				indices[idx++] = d;
				indices[idx++] = e;
			}
		}

		const geom = new THREE.BufferGeometry();
		geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
		geom.setAttribute("aWeights", new THREE.BufferAttribute(weights, 4));
		geom.setIndex(new THREE.BufferAttribute(indices, 1));
		geom.computeVertexNormals();

		return geom;
	}, [width, height, tilesU32, tileSize, uvScale]);
	
	const onBeforeCompile = useCallback(
		(shader) => {
			const texFn =
				shader.glslVersion === THREE.GLSL3 ? "texture" : "texture2D";

			shader.uniforms.tGrass = { value: tGrass };
			shader.uniforms.tDirt = { value: tDirt };
			shader.uniforms.tRock = { value: tRock };
			shader.uniforms.tWater = { value: tWater };

			// --- VERTEX: add weights + our own UV varying (vTerrainUv)
			shader.vertexShader = shader.vertexShader
				.replace(
					"#include <common>",
					`#include <common>
       attribute vec4 aWeights;
       varying vec4 vWeights;
       varying vec2 vTerrainUv;`
				)
				// uv is available when the shader includes UV chunks; with StandardMaterial + map set, it will.
				.replace(
					"#include <uv_vertex>",
					`#include <uv_vertex>
       vTerrainUv = uv;`
				)
				.replace(
					"#include <begin_vertex>",
					`#include <begin_vertex>
       vWeights = aWeights;`
				);

			// --- FRAGMENT: declare uniforms/varyings and replace map_fragment with our blend
			shader.fragmentShader = shader.fragmentShader
				.replace(
					"#include <common>",
					`#include <common>
       uniform sampler2D tGrass;
       uniform sampler2D tDirt;
       uniform sampler2D tRock;
       uniform sampler2D tWater;
       varying vec4 vWeights;
       varying vec2 vTerrainUv;`
				)
				.replace(
					"#include <map_fragment>",
					`
      // --- Custom blended albedo (replaces standard map sampling)
      vec4 w = max(vWeights, 0.0);
      float s = w.x + w.y + w.z + w.w;
      if (s > 0.0) w /= s;

      vec2 uv = vTerrainUv;

      vec4 cGrass = ${texFn}(tGrass, uv);
      vec4 cDirt  = ${texFn}(tDirt,  uv);
      vec4 cRock  = ${texFn}(tRock,  uv);
      vec4 cWater = ${texFn}(tWater, uv);

      vec4 blended =
        cGrass * w.x +
        cDirt  * w.y +
        cRock  * w.z +
        cWater * w.w;

      // Optional: quick sRGB -> linear (approx). Comment out if you don't care yet.
      blended.rgb = pow(blended.rgb, vec3(2.2));

      diffuseColor *= blended;
      `
				);
		},
		[tGrass, tDirt, tRock, tWater]
	);

	return (
		<mesh
			ref={meshRef}
			geometry={geometry}
			receiveShadow
			castShadow
			position={[-0.5, 0.5, -0.5]}
		>
			<meshStandardMaterial
				roughness={1}
				metalness={0}
				onBeforeCompile={onBeforeCompile}
				map={tGrass} // forces USE_MAP / UV chunks to exist
			/>
		</mesh>
	);
};

export default Terrain;
