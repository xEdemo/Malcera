export const buildMapDefaultValues = (map) => {
	return {
		key: map?.key ?? "",

		width: map?.width ?? null,
		height: map?.height ?? null,

		skybox: {
			key: map?.skybox?.key ?? "",
			rotationY: map?.skybox?.rotationY ?? null,
			intensity: map?.flags?.intensity ?? null,
		},

		lighting: {
			ambient: { 
				intensity: map?.lighting?.ambient?.intensity ?? null, 
				color: map?.lighting?.ambient?.color ?? "",
			},
			directional: {
				position: {
					x: map?.lighting?.directional?.position?.x ?? null,
					y: map?.lighting?.directional?.position?.y ?? null,
					z: map?.lighting?.directional?.position?.z ?? null,
				},
				intensity: map?.lighting?.directional?.intensity ?? null,
				color: map?.lighting?.directional?.color ?? "",
			},
			point: map?.lighting?.point ?? [],
		},

		tiles: map?.tiles ?? [],

		assets: map?.assets ?? [],

		comments: "",
	};
};
