import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { maps, tileWidth, tileLength, gridRows, gridColumns } from "./maps.js";
import { isWalkable, findPath } from "./pathing.js";
import { useDispatch } from "react-redux";
import { useUpdatePositionMutation } from "../../slices/updateUser/updateUserApiSlice.js";
import {
	updateUserPosition,
	updateUserMap,
} from "../../slices/user/userSlice.js";
import { toast } from "react-toastify";
import terrainss from "../../assets/sprites/terrain/terrainss.png";
import { getPosition } from "../../slices/updateUser/updateUserSlice.js";
import {
	Canvas as CanvasFiber,
	useFrame
} from "@react-three/fiber";
import { PerspectiveCamera, Sparkles, Sky } from "@react-three/drei";
import * as THREE from 'three';

const playerSpeedMultiplier = 5.0;
const cameraSpeedMultiplier = 2.5;

const playerHeight = 1.5;

const Canvas = ({ isLeftSidebarOpen, isRightSidebarOpen, userData, refetchUserData }) => {
	const dispatch = useDispatch();

	// Will have to be an empty array when there are more images
	const imageRef = useRef(null);

	const [ws, setWs] = useState(null);
	const [otherPlayers, setOtherPlayers] = useState([]);

	const [shouldRenderCanvas, setShouldRenderCanvas] = useState(true);

	const [currentMap, setCurrentMap] = useState(userData.currentMap);
	const [playerPosition, setPlayerPosition] = useState({
		x: userData.position.x,
		y: userData.position.y,
		z: maps[userData.currentMap][userData.position.y][userData.position.x]
			.z,
	});

	const [updatePositionMut] = useUpdatePositionMutation();

	const updatePositionDB = async (x, y, map) => {
		try {
			const res = await updatePositionMut({
				x,
				y,
				map,
			});
			if (res.data) {
				refetchUserData();
			}
			if (res.error && res.error.data && res.error.data.message) {
				toast.error(res.error.data.message);
			}
		} catch (error) {
			toast.error("Error updating user position.");
		}
	};

	useEffect(() => {
		const ws = new WebSocket(`ws://localhost:5000`);
		setWs(ws);

		ws.addEventListener("open", () => {
			console.log("Canvas WebSocket connection opened");
		});

		ws.addEventListener("message", (e) => {
			const data = JSON.parse(e.data);
			if (data.playerPositions) {
				setOtherPlayers(data.playerPositions);
				//console.log(data.playerPositions);
			}
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
			const res = await dispatch(getPosition());
			if (res.payload) {
				setPlayerPosition({
					x: res.payload.x,
					y: res.payload.y,
					z: maps[userData.currentMap][res.payload.y][res.payload.x]
						.z,
				});
			}
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

	// Add particles
	return (
		<div style={{ padding: "10px" }}>
			{shouldRenderCanvas && (
				<CanvasFiber
					style={{
						width: "100%",
						height: "calc(100vh - 126px)",
					}}
				>
					<Sky sunPosition={[10, 10, 10]} distance={4500} />
					<ambientLight intensity={0.9} />
					<pointLight castShadow intensity={0.9} position={[10, 0, 10]} />
					{maps[currentMap].map((row, rowIndex) =>
						row.map((tile, colIndex) => (
							<Tile
								key={`${rowIndex}-${colIndex}`}
								position={[colIndex, -rowIndex, tile.z]} // Adjusting y to negative for correct orientation
								color={
									tile.v === 1
										? "hotpink"
										: tile.v === 2
										? "blue"
										: tile.v === 3
										? "red"
										: tile.v === 4
										? "indianred"
										: tile.v >= 900
										? "black"
										: "gray"
								} // Different colors/images based on tile value
								currentMap={currentMap}
								userData={userData}
							/>
						))
					)}
					<Player
						position={playerPosition}
						color={"red"}
						updatePositionDB={updatePositionDB}
						currentMap={currentMap}
						setCurrentMap={setCurrentMap}
						setPlayerPosition={setPlayerPosition}
						ws={ws}
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
				</CanvasFiber>
			)}
		</div>
	);
};

const Tile = ({ position, color, currentMap, userData }) => {
	const ref = useRef();
	const [isTileHovered, setIsTileHovered] = useState(false);
	const [isTileClicked, setIsTileClicked] = useState(false);

	useEffect(() => {
		document.body.style.cursor = isTileHovered ? "pointer" : "auto";
	}, [isTileHovered]);

	const handlePointerOver = (e) => {
		e.stopPropagation();
		if (
			isWalkable(
				userData.position.x,
				userData.position.y,
				maps[currentMap][userData.position.y][
					userData.position.x
				].z,
				position[0],
				Math.abs(position[1]),
				position[2],
				maps[currentMap]
			)
		) {
			setIsTileHovered(true);
		}
	};

	const handlePointerDown = (e) => {
		e.stopPropagation();
		const start = [userData.position.x, userData.position.y, maps[currentMap][userData.position.y][userData.position.x].z];
		const goal = [position[0], Math.abs(position[1]), position[2]];
		const shortestPath = findPath(start, goal, maps[currentMap]);
		if (shortestPath.length > 0) {
			setIsTileClicked(true);
			console.log(shortestPath);
		}
	};

	return (
		<group position={position} ref={ref} receiveShadow>
			<mesh>
				<boxGeometry args={[1, 1, 1]} />
				<meshStandardMaterial color={color} />
			</mesh>
			<mesh
				position={[0, 0, 0.51]}
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
					<mesh position={[0, 0, 0.515]}>
						<ringGeometry args={[0.3, 0.5, 25]} />
						<meshStandardMaterial color={"gold"} />
					</mesh>
					<Sparkles
						count={10}
						size={2}
						speed={0.5}
						color={"yellow"}
						position={[0, 0, 0.6]}
					/>
				</>
			)}
			{isTileClicked && <Chevron />}
		</group>
	);
};

const OtherPlayers = ({ player }) => {
	const ref = useRef();

	return (
		<mesh
			key={player.id}
			position={[player.x, -player.y, player.z + playerHeight]}
			ref={ref}
		>
			<boxGeometry args={[1, 1, 2, 2, 2, 2]} />
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

	const handleMove = (direction) => {
		const currentTime = Date.now();
		if (currentTime - lastMoveTime < moveDelay) return;

		const { x, y, z } = playerPositionRef.current;
		let newX = x,
			newY = y,
			newZ = z;

		if (direction === "left" && x > 0) newX -= 1;
		if (direction === "right" && x < maps[currentMap][0].length - 1)
			newX += 1;
		if (direction === "up" && y > 0) newY -= 1;
		if (direction === "down" && y < maps[currentMap].length - 1) newY += 1;

		const checkZ = Math.abs(
			maps[currentMap][newY][newX].z - maps[currentMap][y][x].z
		);

		if (checkZ > 1) return;

		if (
			maps[currentMap][newY] &&
			maps[currentMap][newY][newX].v > 0 &&
			maps[currentMap][newY][newX].v < 900
		) {
			if (newX !== x || newY !== y) {
				setLastMoveTime(currentTime);
				targetPositionRef.current = {
					x: newX,
					y: newY,
					z: maps[currentMap][newY][newX].z,
				};
				playerPositionRef.current = {
					x: newX,
					y: newY,
					z: maps[currentMap][newY][newX].z,
				};
				//setPlayerPosition({ x: newX, y: newY, z: newZ });
				updatePositionDB(newX, newY, currentMap);
			}
		} else if (maps[currentMap][newY][newX].v === 900) {
			setLastMoveTime(currentTime);
			setCurrentMap("limbo");
			targetPositionRef.current = {
				x: 18,
				y: 18,
				z: maps["limbo"][18][18].z,
			};
			playerPositionRef.current = {
				x: 18,
				y: 18,
				z: maps["limbo"][18][18].z,
			};
			setPlayerPosition({ x: 18, y: 18, z: maps["limbo"][18][18].z });
			ws.send(
				JSON.stringify({
					type: "playerMove",
					payload: {
						x: 18,
						y: 18,
						z: maps["limbo"][18][18].z,
						map: "limbo",
					},
				})
			);
			updatePositionDB(18, 18, "limbo");
		} else if (maps[currentMap][newY][newX].v === 901) {
			setLastMoveTime(currentTime);
			setCurrentMap("tutorial");
			targetPositionRef.current = {
				x: 1,
				y: 18,
				z: maps["tutorial"][18][1].z,
			};
			playerPositionRef.current = {
				x: 1,
				y: 18,
				z: maps["tutorial"][18][1].z,
			};
			setPlayerPosition({ x: 1, y: 18, z: maps["tutorial"][18][1].z });
			ws.send(
				JSON.stringify({
					type: "playerMove",
					payload: {
						x: 1,
						y: 18,
						z: maps["tutorial"][18][1].z,
						map: "tutorial",
					},
				})
			);
			updatePositionDB(1, 18, "tutorial");
		}
	};

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

	// May be too much for useFrame
	useFrame((state, delta) => {
		if (isMoving.up) handleMove("up");
		if (isMoving.left) handleMove("left");
		if (isMoving.down) handleMove("down");
		if (isMoving.right) handleMove("right");

		if (ref.current) {
			const currentPosition = ref.current.position;

			const directionX = targetPositionRef.current.x - currentPosition.x;
			const directionY = -targetPositionRef.current.y - currentPosition.y;
			const directionZ =
				targetPositionRef.current.z + playerHeight - currentPosition.z;

			const distance = Math.sqrt(
				directionX * directionX +
					directionY * directionY +
					directionZ * directionZ
			);

			// Keeps player from shaking violently
			if (distance > 0.05) {
				const moveX = (directionX / distance) * playerSpeedMultiplier;
				const moveY = (directionY / distance) * playerSpeedMultiplier;
				const moveZ = (directionZ / distance) * playerSpeedMultiplier;

				currentPosition.x += moveX * delta;
				currentPosition.y += moveY * delta;
				currentPosition.z += moveZ * delta;
				// Animates player movement based on calculations above
				ws.send(
					JSON.stringify({
						type: "playerMove",
						payload: {
							x: currentPosition.x,
							y: -currentPosition.y,
							z: currentPosition.z - playerHeight,
							map: currentMap,
						},
					})
				);
			} else {
				currentPosition.x = targetPositionRef.current.x;
				currentPosition.y = -targetPositionRef.current.y;
				currentPosition.z = targetPositionRef.current.z + playerHeight;
				// Needed to continuously update the player's correct position to other players; Can more than likely optimize this
				ws.send(
					JSON.stringify({
						type: "playerMove",
						payload: {
							x: currentPosition.x,
							y: -currentPosition.y,
							z: currentPosition.z - playerHeight,
							map: currentMap,
						},
					})
				);
			}
		}

		if (cameraRef.current) {
			cameraRef.current.position.lerp(
				{
					x: targetPositionRef.current.x,
					y: -targetPositionRef.current.y - 9.5,
					z:
						9 +
						maps[currentMap][targetPositionRef.current.y][
							targetPositionRef.current.x
						].z,
				},
				delta * cameraSpeedMultiplier
			);
			cameraRef.current.rotation.x = Math.PI / 4; // Adjust this value to change the camera's pitch angle
			cameraRef.current.rotation.y = 0; // Camera's yaw angle
			cameraRef.current.rotation.z = 0; // Adjust this value to change the camera's roll angle
			cameraRef.current.updateProjectionMatrix();
		}
	});

	return (
		<>
			<PerspectiveCamera
				ref={cameraRef}
				makeDefault
				position={[position.x, -position.y, 9]}
			/>
			<mesh
				position={[position.x, -position.y, position.z + playerHeight]}
				ref={ref}
			>
				<boxGeometry args={[1, 1, 2, 2, 2, 2]} />
				<meshStandardMaterial color={color} wireframe />
			</mesh>
		</>
	);
};

const Chevron = ({ position }) => {
	const ref = useRef();

	const positions = [
		// Right lower plate
		0, -0.2, 0,
		1, -0.2, 1,
		1, 0.2, 1,

		0, -0.2, 0,
		0, 0.2, 0,
		1, 0.2, 1,

		// Right upper plate
		0, -0.2, 0.6,
		1, -0.2, 1.6,
		1, 0.2, 1.6,

		0, -0.2, 0.6,
		0, 0.2, 0.6,
		1, 0.2, 1.6,

		// Far right wall
		1, -0.2, 1.6,
		1, -0.2, 1,
		1, 0.2, 1,

		1, 0.2, 1,
		1, 0.2, 1.6, 
		1, -0.2, 1.6,

		// Right south wall
		0, -0.2, 0,
		1, -0.2, 1,
		1, -0.2, 1.6, 

		1, -0.2, 1.6, 
		0, -0.2, 0.6,
		0, -0.2, 0,

		// Right north wall
		0, 0.2, 0,
		1, 0.2, 1,
		1, 0.2, 1.6,

		1, 0.2, 1.6,
		0, 0.2, 0.6,
		0, 0.2, 0,

		// Left lower plate
		0, -0.2, 0,
		-1, -0.2, 1,
		-1, 0.2, 1,

		-1, 0.2, 1,
		0, 0.2, 0,
		0, -0.2, 0,

		// Left upper plate
		0, -0.2, 0.6,
		-1, -0.2, 1.6,
		-1, 0.2, 1.6,

		-1, 0.2, 1.6,
		0, 0.2, 0.6,
		0, -0.2, 0.6,

		// Far left wall
		-1, -0.2, 1.6,
		-1, -0.2, 1,
		-1, 0.2, 1,

		-1, 0.2, 1,
		-1, 0.2, 1.6,
		-1, -0.2, 1.6,

		// Left south wall
		0, -0.2, 0,
		-1, -0.2, 1,
		-1, -0.2, 1.6,

		-1, -0.2, 1.6,
		0, -0.2, 0.6,
		0, -0.2, 0,

		// Left north wall
		0, 0.2, 0,
		-1, 0.2, 1,
		-1, 0.2, 1.6,

		-1, 0.2, 1.6,
		0, 0.2, 0.6,
		0, 0.2, 0,
	];

	const newPositions = new Float32Array(positions.map(v => v / 4));

	useFrame(({ clock }) => {
		const t = clock.getElapsedTime();
		ref.current.position.z = 1 + 0.25 * Math.sin(t * 2);
		ref.current.rotation.z = t;
	});

	return (
		<mesh ref={ref} position={position}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" array={newPositions} count={positions.length / 3} itemSize={3} />
			</bufferGeometry>
			<meshStandardMaterial color="gold" side={THREE.DoubleSide} />
		</mesh>
	)
} 

export default Canvas;
