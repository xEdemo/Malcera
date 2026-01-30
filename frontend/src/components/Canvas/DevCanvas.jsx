import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import {
	OrbitControls,
	Sparkles,
	Sky,
	Stars,
	useGLTF,
} from "@react-three/drei";
import { maps, tileWidth, tileLength, gridRows, gridColumns } from "./maps.js";
import { isWalkable } from "./pathing.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchMapByKey } from "../../slices/map/mapSlice.js";
import { base64ToUint32Array } from "../../utils/tilePacking.js";
import * as THREE from "three";
import rockUrl from "../../assets/3D/environment/rock1.glb?url";
import testCubeUrl from "../../assets/3D/environment/TestCube.glb?url";
import Terrain from "./Terrain.jsx";
import { toast } from "react-toastify";

function Rock(props) {
	const { scene } = useGLTF(rockUrl);

	// optional, but helps avoid "Disposed" weirdness if you mount/unmount a lot
	return <primitive object={scene} {...props} dispose={null} />;
}

function Cube(props) {
	const { scene } = useGLTF(testCubeUrl);

	// optional, but helps avoid "Disposed" weirdness if you mount/unmount a lot
	return <primitive object={scene} {...props} dispose={null} />;
}

const DevCanvas = ({ userData }) => {
	const dispatch = useDispatch();

	const [selectedMap, setSelectedMap] = useState("test");

	const fetchMap = async () => {
		try {
			const res = await dispatch(fetchMapByKey(selectedMap)).unwrap();
		} catch (error) {
			toast.error(`Error fetching map: ${error}`);
		}
	};

	useEffect(() => {
		fetchMap();
	}, [selectedMap]);

	const mapDoc = useSelector((state) => state.map.mapByKey[selectedMap]);

	const tilesU32 = useMemo(() => {
		if (!mapDoc?.tilesBase64) return null;
		return base64ToUint32Array(mapDoc.tilesBase64);
	}, [mapDoc?.tilesBase64]);

	return (
		<div style={{ padding: "10px" }}>
			<Canvas
				style={{
					width: "100%",
					height: "calc(100vh - 126px)",
				}}
				shadows
			>
				<Sky sunPosition={[0, 0, 0]} distance={1} />
				<Stars
					radius={150}
					depth={50}
					count={4000}
					factor={3}
					fade
					speed={1}
				/>

				{mapDoc?.lighting?.ambient && (
					<ambientLight
						intensity={mapDoc?.lighting?.ambient?.intensity}
						color={"#ffffff"}
					/>
				)}

				{mapDoc?.lighting?.directional && (
					<directionalLight
						intensity={mapDoc?.lighting?.directional?.intensity}
						color={mapDoc?.lighting?.directional?.color}
						position={[
							mapDoc?.lighting?.directional?.position?.x,
							mapDoc?.lighting?.directional?.position?.y,
							mapDoc?.lighting?.directional?.position?.z,
						]}
					/>
				)}

				{mapDoc?.lighting?.point.length >= 1 &&
					mapDoc?.lighting?.point.map((p, i) => (
						<pointLight
							key={i}
							intensity={p?.intensity}
							color={p?.color}
							position={[
								p?.position?.x,
								p?.position?.y,
								p?.position?.z,
							]}
							distance={[p?.distance]}
							decay={p?.decay}
						/>
					))}

				{/* <directionalLight
					castShadow
					position={[15, 25, 15]}
					intensity={5}
					shadow-mapSize-width={2048}
					shadow-mapSize-height={2048}
				/> */}
				{tilesU32 && mapDoc && (
					<Terrain
						width={mapDoc.width}
						height={mapDoc.height}
						tilesU32={tilesU32}
						tileSize={1}
						uvScale={3}
					/>
				)}

				{/* Put it on a tile (x=0,y=10) and rest it on top of tile.z */}
				<Rock position={[10, -10, 1]} scale={1} rotation={[0, 0, 0]} />
				<Cube position={[0, 0, 1]} scale={1} rotation={[0, 0, 0]} />
				<OrbitControls makeDefault />
			</Canvas>
		</div>
	);
};

export default DevCanvas;
