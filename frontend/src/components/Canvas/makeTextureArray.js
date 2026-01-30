import * as THREE from "three";

export function makeTexture2DArrayFromImages(images, width, height) {
	// images: HTMLImageElement[] all same size
	const layers = images.length;

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });

	// RGBA8
	const data = new Uint8Array(width * height * 4 * layers);

	for (let i = 0; i < layers; i++) {
		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(images[i], 0, 0, width, height);
		const imgData = ctx.getImageData(0, 0, width, height).data;
		data.set(imgData, i * width * height * 4);
	}

	const tex = new THREE.DataArrayTexture(data, width, height, layers);
	tex.format = THREE.RGBAFormat;
	tex.type = THREE.UnsignedByteType;
	tex.minFilter = THREE.LinearMipmapLinearFilter;
	tex.magFilter = THREE.LinearFilter;
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.generateMipmaps = true;

	// If your source images are sRGB (typical for albedo):
	tex.colorSpace = THREE.SRGBColorSpace;

	tex.needsUpdate = true;
	return tex;
}
