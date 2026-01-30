import {
	useRef,
	useEffect,
	useState,
	useCallback,
	useMemo,
	Suspense,
} from "react";
import { isWalkable, findPath } from "./pathing.js";
import { base64ToUint32Array } from "../../utils/tilePacking.js";
import { useDispatch, useSelector } from "react-redux";
import { useUpdatePositionMutation } from "../../slices/updateUser/updateUserApiSlice.js";
import { getPosition } from "../../slices/updateUser/updateUserSlice.js";
import { fetchMapByKey, setActiveMapKey } from "../../slices/map/mapSlice.js";
import { unpackY, unpackP, unpackV, unpackW } from "../../utils/tilePacking.js";
import { Canvas as CanvasFiber, useFrame, useThree } from "@react-three/fiber";
import {
	PerspectiveCamera,
	Sparkles,
	Sky,
	OrbitControls,
	useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import Terrain from "./Terrain.jsx";
import { toast } from "react-toastify";

const playerSpeedMultiplier = 5.0;
const cameraSpeedMultiplier = 2.5;

const playerHeight = 1.5;

function Cube(props) {
	const { scene } = useGLTF("/src/assets/3D/environment/TestCube.glb");

	// optional, but helps avoid "Disposed" weirdness if you mount/unmount a lot
	return <primitive object={scene} {...props} dispose={null} />;
}

const Canvas = ({
	isLeftSidebarOpen,
	isRightSidebarOpen,
	userData,
	refetchUserData,
}) => {
	const dispatch = useDispatch();

	const [currentMap, setCurrentMap] = useState(userData.world.currentMap);
	const [playerPosition, setPlayerPosition] = useState(() => {
		const x = userData.world.position.x;
		const z = userData.world.position.z;
		const y = 0; // will be corrected in effect
		return { x, y, z };
	});

	// Fetches currentMap whenever it channges
	useEffect(() => {
		dispatch(setActiveMapKey(currentMap));
		dispatch(fetchMapByKey(currentMap))
			.unwrap()
			.catch((e) => toast.error(e));
	}, [dispatch, currentMap]);

	const mapDoc = useSelector((state) => state.map.mapByKey[currentMap]);

	const tilesU32 = useMemo(() => {
		if (!mapDoc?.tilesBase64) return null;
		try {
			return base64ToUint32Array(mapDoc.tilesBase64);
		} catch (e) {
			console.error(e);
			return null;
		}
	}, [mapDoc?.tilesBase64]);

	const width = mapDoc?.width ?? 0;
	const height = mapDoc?.height ?? 0;

	const inBounds = useCallback(
		(x, z) => x >= 0 && z >= 0 && x < width && z < height,
		[width, height]
	);

	const getPacked = useCallback(
		(x, z) => {
			if (!tilesU32 || !inBounds(x, z)) return 0;
			return tilesU32[z * width + x] >>> 0;
		},
		[tilesU32, width, inBounds]
	);

	const getY = useCallback((x, z) => unpackY(getPacked(x, z)), [getPacked]);
	const getV = useCallback((x, z) => unpackV(getPacked(x, z)), [getPacked]);
	const isPortalTile = useCallback(
		(x, z) => unpackP(getPacked(x, z)),
		[getPacked]
	);

	const [ws, setWs] = useState(null);
	const [otherPlayers, setOtherPlayers] = useState([]);
	const [shouldRenderCanvas, setShouldRenderCanvas] = useState(true);

	useEffect(() => {
		if (!tilesU32 || !mapDoc) return;

		const x = userData.world.position.x;
		const z = userData.world.position.z;

		if (x == null || z == null) return;
		if (x < 0 || z < 0 || x >= width || z >= height) return;

		setPlayerPosition({ x, z, y: getY(x, z) });
	}, [
		tilesU32,
		mapDoc,
		width,
		height,
		getY,
		userData.world.position.x,
		userData.world.position.z,
	]);

	useEffect(() => {
		if (!mapDoc || !tilesU32) return;

		setPlayerPosition((prev) => {
			const x = prev.x;
			const z = prev.z;
			if (x < 0 || z < 0 || x >= mapDoc.width || z >= mapDoc.height)
				return prev;

			const idx = z * mapDoc.width + x;
			const y = unpackY(tilesU32[idx] >>> 0);

			// only update if y changed (prevents render jitter)
			if (prev.y === y) return prev;
			return { ...prev, y };
		});
	}, [mapDoc?.key, mapDoc?.width, mapDoc?.height, tilesU32]);

	const [updatePositionMut] = useUpdatePositionMutation();

	const updatePositionDB = async (x, z, map) => {
		try {
			const res = await updatePositionMut({ x, z, map });
			if (res.data) refetchUserData();
			if (res.error?.data?.message) toast.error(res.error.data.message);
		} catch (error) {
			toast.error("Error updating user position.");
		}
	};

	useEffect(() => {
		const ws = new WebSocket(`ws://${import.meta.env.VITE_BACKEND_URL}`);
		setWs(ws);

		ws.addEventListener("open", () => {
			console.log("Canvas WebSocket connection opened");
		});

		ws.addEventListener("message", (e) => {
			const data = JSON.parse(e.data);
			if (data.playerPositions) setOtherPlayers(data.playerPositions);
		});

		ws.addEventListener("close", () => {
			console.log("Canvas WebSocket connection closed");
		});

		return () => {
			if (ws) {
				ws.close();
			}
		};
	}, []);

	const fetchPosition = async () => {
		try {
			const res = await dispatch(getPosition()).unwrap();
			if (!res) return;

			const x = res.x;
			const z = res.z;

			if (!mapDoc || !tilesU32) return; // map not loaded yet
			if (!inBounds(x, z)) return;

			setPlayerPosition({ x, z, y: getY(x, z) });
		} catch (err) {
			console.error(`Error fetching player position: ${err}`);
		}
	};

	useEffect(() => {
		if (isRightSidebarOpen || isLeftSidebarOpen) {
			// Get request here to setPlayerPosition
			fetchPosition();
			setShouldRenderCanvas(false);
			const timeoutId = setTimeout(() => {
				setShouldRenderCanvas(true);
			}, 0); // This number should match the sidebar animation duration
			return () => clearTimeout(timeoutId);
		} else {
			setShouldRenderCanvas(true);
		}
	}, [isRightSidebarOpen, isLeftSidebarOpen]);

	return (
		<div style={{ padding: "10px" }}>
			{shouldRenderCanvas && (
				<CanvasFiber
					style={{
						width: "100%",
						height: "calc(100vh - 126px)",
					}}
					shadows
				>
					<Sky sunPosition={[10, 10, 10]} distance={4500} />

					{mapDoc?.lighting?.ambient && (
						<ambientLight
							intensity={mapDoc?.lighting?.ambient?.intensity}
							color={mapDoc?.lighting?.ambient?.color}
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

					{tilesU32 && mapDoc && (
						<Terrain
							width={mapDoc.width}
							height={mapDoc.height}
							tilesU32={tilesU32}
							tileSize={1}
							uvScale={3}
						/>
					)}

					<Player
						position={playerPosition}
						color={"lime"}
						updatePositionDB={updatePositionDB}
						currentMap={currentMap}
						setCurrentMap={setCurrentMap}
						setPlayerPosition={setPlayerPosition}
						ws={ws}
						mapDoc={mapDoc}
						tilesU32={tilesU32}
						getY={getY}
						getV={getV}
						isPortalTile={isPortalTile}
					/>

					{otherPlayers
						.filter(
							(player) =>
								player.id !== userData._id &&
								player.map === currentMap
						)
						.map((player) => (
							<OtherPlayers key={player.id} player={player} />
						))}

					<Cube position={[0, 0, 0]} scale={1} rotation={[0, 0, 0]} />
				</CanvasFiber>
			)}
		</div>
	);
};

const Tile = ({ position, color, currentMap, userData }) => {
	const [isTileHovered, setIsTileHovered] = useState(false);
	const [isTileClicked, setIsTileClicked] = useState(false);

	useEffect(() => {
		document.body.style.cursor = isTileHovered ? "pointer" : "auto";
	}, [isTileHovered]);

	const handlePointerOver = (e) => {
		e.stopPropagation();
		const startX = userData.world.position.x; // col
		const startY = userData.world.position.z; // row
		const startZ = maps[currentMap][startY][startX].y; // height

		const targetX = position[0]; // col
		const targetY = position[2]; // row
		const targetZ = position[1]; // height
		if (
			isWalkable(
				startX,
				startY,
				startZ,
				targetX,
				targetY,
				targetZ,
				maps[currentMap]
			)
		) {
			setIsTileHovered(true);
		}
	};

	const handlePointerDown = (e) => {
		e.stopPropagation();

		const startX = userData.world.position.x; // col
		const startY = userData.world.position.z; // row
		const startZ = maps[currentMap][startY][startX].y; // height

		const start = [startX, startY, startZ];
		const goal = [position[0], position[2], position[1]];

		const shortestPath = findPath(start, goal, maps[currentMap]);
		if (shortestPath.length > 0) {
			setIsTileClicked(true);
			console.log(shortestPath);
		}
	};

	return (
		<group position={position} receiveShadow>
			<mesh>
				<boxGeometry args={[1, 1, 1]} />
				<meshStandardMaterial color={color} />
			</mesh>
			<mesh
				position={[0, 0.51, 0]}
				onPointerOver={(e) => handlePointerOver(e)}
				onPointerOut={() => setIsTileHovered(false)}
				onPointerDown={(e) => handlePointerDown(e)}
				onPointerUp={() => setIsTileClicked(false)}
			>
				<planeGeometry args={[1, 1]} />
				<meshStandardMaterial visible={isTileHovered} color={color} />
			</mesh>
			{isTileHovered && (
				<>
					<mesh position={[0, 0.515, 0]}>
						<ringGeometry args={[0.3, 0.5, 25]} />
						<meshStandardMaterial color={"gold"} />
					</mesh>
					<Sparkles
						count={10}
						size={2}
						speed={0.5}
						color={"yellow"}
						position={[0, 0.6, 0]}
					/>
				</>
			)}
			{isTileClicked && <Chevron />}
		</group>
	);
};

const OtherPlayers = ({ player }) => {
	return (
		<mesh position={[player.x, player.y + playerHeight, player.z]}>
			<boxGeometry args={[1, 2, 1, 2, 2, 2]} />
			<meshStandardMaterial color="blue" wireframe />
		</mesh>
	);
};

const Player = ({
	position,
	color,
	updatePositionDB,
	currentMap,
	setCurrentMap,
	setPlayerPosition,
	ws,
	mapDoc,
	tilesU32,
	getY,
	getV,
	isPortalTile,
}) => {
	const ref = useRef();
	const cameraRef = useRef();

	const [isMoving, setIsMoving] = useState({
		left: false,
		right: false,
		up: false,
		down: false,
	});
	const playerPositionRef = useRef(position);
	const targetPositionRef = useRef(position);
	//console.log(position);

	const [lastMoveTime, setLastMoveTime] = useState(0);
	const moveDelay = 300;

	const portalByIndex = useMemo(() => {
		if (!mapDoc?.portals?.length || !mapDoc?.width) return new Map();
		const m = new Map();
		for (const p of mapDoc.portals) {
			const idx = p.from.z * mapDoc.width + p.from.x;
			m.set(idx, p.to);
		}
		return m;
	}, [mapDoc?.portals, mapDoc?.width]);

	const handleMove = (direction) => {
		if (!mapDoc || !tilesU32) return;

		const currentTime = Date.now();
		if (currentTime - lastMoveTime < moveDelay) return;

		const width = mapDoc.width;
		const height = mapDoc.height;

		const { x, z } = playerPositionRef.current;

		let newX = x;
		let newZ = z;

		if (direction === "left" && x > 0) newX -= 1;
		if (direction === "right" && x < width - 1) newX += 1;
		if (direction === "up" && z > 0) newZ -= 1;
		if (direction === "down" && z < height - 1) newZ += 1;

		if (newX === x && newZ === z) return;

		const idxFrom = z * width + x;
		const idxTo = newZ * width + newX;

		const packedFrom = tilesU32[idxFrom] >>> 0;
		const packedTo = tilesU32[idxTo] >>> 0;

		const fromH = unpackY(packedFrom);
		const toH = unpackY(packedTo);

		// vertical step limit
		if (Math.abs(toH - fromH) > 1) return;

		// walkable based on packed flag
		if (!unpackW(packedTo)) return;

		// PORTAL: trigger based on portal list (reliable)
		const dest = portalByIndex.get(idxTo);

		console.log(
			"stepped idxTo",
			idxTo,
			"portal?",
			portalByIndex.has(idxTo),
			mapDoc.portals
		);
		if (dest) {
			setLastMoveTime(currentTime);

			const next = { x: dest.x, z: dest.z, y: 0 };

			setCurrentMap(dest.key);

			targetPositionRef.current = next;
			playerPositionRef.current = next;
			setPlayerPosition(next);

			// snap mesh now to avoid lerp weirdness
			if (ref.current) {
				ref.current.position.set(next.x, next.y + playerHeight, next.z);
			}

			ws?.send(
				JSON.stringify({
					type: "playerMove",
					payload: { ...next, map: dest.key },
				})
			);
			updatePositionDB(dest.x, dest.z, dest.key);

			return;
		}

		// NORMAL MOVE
		setLastMoveTime(currentTime);

		const next = { x: newX, z: newZ, y: toH };
		targetPositionRef.current = next;
		playerPositionRef.current = next;
		setPlayerPosition(next);

		ws?.send(
			JSON.stringify({
				type: "playerMove",
				payload: { ...next, map: currentMap },
			})
		);
		updatePositionDB(newX, newZ, currentMap);
	};

	useEffect(() => {
		playerPositionRef.current = position;
		targetPositionRef.current = position;
	}, [position]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "w") setIsMoving((prev) => ({ ...prev, up: true }));
			if (e.key === "a") setIsMoving((prev) => ({ ...prev, left: true }));
			if (e.key === "s") setIsMoving((prev) => ({ ...prev, down: true }));
			if (e.key === "d")
				setIsMoving((prev) => ({ ...prev, right: true }));
		};

		const handleKeyUp = (e) => {
			if (e.key === "w") setIsMoving((prev) => ({ ...prev, up: false }));
			if (e.key === "a")
				setIsMoving((prev) => ({ ...prev, left: false }));
			if (e.key === "s")
				setIsMoving((prev) => ({ ...prev, down: false }));
			if (e.key === "d")
				setIsMoving((prev) => ({ ...prev, right: false }));
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	useFrame((state, delta) => {
		if (isMoving.up) handleMove("up");
		if (isMoving.left) handleMove("left");
		if (isMoving.down) handleMove("down");
		if (isMoving.right) handleMove("right");

		if (ref.current) {
			const currentPosition = ref.current.position;

			const tx = targetPositionRef.current.x;
			const ty = targetPositionRef.current.y + playerHeight;
			const tz = targetPositionRef.current.z;

			// smooth follow
			currentPosition.x = THREE.MathUtils.lerp(
				currentPosition.x,
				tx,
				delta * playerSpeedMultiplier
			);
			currentPosition.y = THREE.MathUtils.lerp(
				currentPosition.y,
				ty,
				delta * playerSpeedMultiplier
			);
			currentPosition.z = THREE.MathUtils.lerp(
				currentPosition.z,
				tz,
				delta * playerSpeedMultiplier
			);
		}

		if (cameraRef.current) {
			cameraRef.current.position.lerp(
				new THREE.Vector3(
					targetPositionRef.current.x,
					9 + targetPositionRef.current.y,
					targetPositionRef.current.z + 8
				),
				delta * cameraSpeedMultiplier
			);

			cameraRef.current.rotation.x = 5.5;
			cameraRef.current.rotation.y = 0;
			cameraRef.current.rotation.z = 0;
			cameraRef.current.updateProjectionMatrix();
		}
	});

	return (
		<>
			<PerspectiveCamera
				ref={cameraRef}
				makeDefault
				position={[position.x, 9 + position.y, position.z + 8]}
			/>
			{/* <OrbitControls makeDefault /> */}
			<mesh
				position={[position.x, position.y + playerHeight, position.z]}
				ref={ref}
			>
				<boxGeometry args={[1, 2, 1, 2, 2, 2]} />
				<meshStandardMaterial color={color} wireframe />
			</mesh>
		</>
	);
};

const Chevron = ({ position }) => {
	const ref = useRef();

	const positions = [
		// Right lower plate
		0, -0.2, 0, 1, -0.2, 1, 1, 0.2, 1,

		0, -0.2, 0, 0, 0.2, 0, 1, 0.2, 1,

		// Right upper plate
		0, -0.2, 0.6, 1, -0.2, 1.6, 1, 0.2, 1.6,

		0, -0.2, 0.6, 0, 0.2, 0.6, 1, 0.2, 1.6,

		// Far right wall
		1, -0.2, 1.6, 1, -0.2, 1, 1, 0.2, 1,

		1, 0.2, 1, 1, 0.2, 1.6, 1, -0.2, 1.6,

		// Right south wall
		0, -0.2, 0, 1, -0.2, 1, 1, -0.2, 1.6,

		1, -0.2, 1.6, 0, -0.2, 0.6, 0, -0.2, 0,

		// Right north wall
		0, 0.2, 0, 1, 0.2, 1, 1, 0.2, 1.6,

		1, 0.2, 1.6, 0, 0.2, 0.6, 0, 0.2, 0,

		// Left lower plate
		0, -0.2, 0, -1, -0.2, 1, -1, 0.2, 1,

		-1, 0.2, 1, 0, 0.2, 0, 0, -0.2, 0,

		// Left upper plate
		0, -0.2, 0.6, -1, -0.2, 1.6, -1, 0.2, 1.6,

		-1, 0.2, 1.6, 0, 0.2, 0.6, 0, -0.2, 0.6,

		// Far left wall
		-1, -0.2, 1.6, -1, -0.2, 1, -1, 0.2, 1,

		-1, 0.2, 1, -1, 0.2, 1.6, -1, -0.2, 1.6,

		// Left south wall
		0, -0.2, 0, -1, -0.2, 1, -1, -0.2, 1.6,

		-1, -0.2, 1.6, 0, -0.2, 0.6, 0, -0.2, 0,

		// Left north wall
		0, 0.2, 0, -1, 0.2, 1, -1, 0.2, 1.6,

		-1, 0.2, 1.6, 0, 0.2, 0.6, 0, 0.2, 0,
	];

	const newPositions = new Float32Array(positions.map((v) => v / 4));

	useFrame(({ clock }) => {
		const t = clock.getElapsedTime();
		ref.current.position.z = 1 + 0.25 * Math.sin(t * 2);
		ref.current.rotation.z = t;
	});

	return (
		<mesh ref={ref} position={position}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					array={newPositions}
					count={positions.length / 3}
					itemSize={3}
				/>
			</bufferGeometry>
			<meshStandardMaterial color="gold" side={THREE.DoubleSide} />
		</mesh>
	);
};

export default Canvas;
