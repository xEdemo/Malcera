import { useRef, useEffect, useState, useCallback } from "react";
import { maps, tileWidth, tileLength, gridRows, gridColumns } from "./maps.js";
import { useSelector, useDispatch } from "react-redux";
import { useUpdatePositionMutation } from "../../slices/updateUser/updateUserApiSlice.js";
import {
	updateUserPosition,
	updateUserMap,
} from "../../slices/user/userSlice.js";
import { toast } from "react-toastify";
import terrainss from "../../assets/sprites/terrain/terrainss.png";
import { getPosition } from "../../slices/updateUser/updateUserSlice.js";
import { Canvas as CanvasFiber, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";

const playerSpeedMultiplier = 5.0;
const cameraSpeedMultiplier = 2.5;

const playerHeight = 1.5;

const Canvas = ({ isLeftSidebarOpen, isRightSidebarOpen }) => {
	const dispatch = useDispatch();

	const { userInfo } = useSelector((state) => state.auth);

	// Will have to be an empty array when there are more images
	const imageRef = useRef(null);

	const [ws, setWs] = useState(null);
	const [otherPlayers, setOtherPlayers] = useState([]);
	const [wsReadyState, setWsReadyState] = useState(0);

	const [shouldRenderCanvas, setShouldRenderCanvas] = useState(true);

	const [currentMap, setCurrentMap] = useState(userInfo.currentMap);
	const [playerPosition, setPlayerPosition] = useState({
		x: userInfo.position.x,
		y: userInfo.position.y,
		z: maps[userInfo.currentMap][userInfo.position.y][userInfo.position.x]
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
				dispatch(updateUserPosition({ x, y }));
				if (map) {
					dispatch(updateUserMap(map));
				}
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
			// Loads in player initial position when they load in
			//setRoo(1);
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
					z: maps[userInfo.currentMap][res.payload.y][res.payload.x].z,
				});
			}
		} catch (err) {
			console.error(`Error fetching player position: ${err}`);
		}
	};

	useEffect(() => {
		if (isRightSidebarOpen) {
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

	useEffect(() => {
		if (ws) {
			setTimeout(() => {
				setWsReadyState(1);
			}, 125);
		}
	}, [ws]);

	// Temp fix to render the player and other players on refresh and on load (doesn't work with throttling)
	useEffect(() => {
		if (ws && ws.readyState === 1) {
			ws.send(
				JSON.stringify({
					type: "playerMove",
					payload: {
						x: userInfo.position.x,
						y: userInfo.position.y,
						z: maps[userInfo.currentMap][userInfo.position.y][
							userInfo.position.x
						].z,
						map: userInfo.currentMap,
					},
				})
			);
		}
	}, [wsReadyState]);

	// Add particles
	return (
		<div style={{ padding: "10px" }}>
			{shouldRenderCanvas && (
				<CanvasFiber
					style={{
						width: "100%",
						height: "calc(100vh - 126px)",
						backgroundColor: "black",
					}}
				>
					<ambientLight intensity={0.6} />
					<directionalLight />
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
								player.id !== userInfo._id &&
								player.map === currentMap
						)
						.map((player) => (
							<OtherPlayers key={player.id} player={player} />
						))}
					{/* <OrbitControls /> */}
				</CanvasFiber>
			)}
		</div>
	);
};

const Tile = ({ position, color }) => {
	const ref = useRef();

	return (
		<mesh position={position} ref={ref}>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color={color} />
		</mesh>
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
			<boxGeometry args={[1, 1, 2]} />
			<meshStandardMaterial color="blue" />
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

		if (
			maps[currentMap][newY] &&
			maps[currentMap][newY][newX].v > 0 &&
			maps[currentMap][newY][newX].v < 900 &&
			checkZ <= 1
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
				// setPlayerPosition({ x: newX, y: newY });
				updatePositionDB(newX, newY, currentMap);
			}
		} else if (maps[currentMap][newY][newX].v === 900 && checkZ <= 1) {
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
		} else if (maps[currentMap][newY][newX].v === 901 && checkZ <= 1) {
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
						maps[currentMap][playerPositionRef.current.y][
							playerPositionRef.current.x
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
				position={[position.x, -position.y, 5]}
			/>
			<mesh
				position={[position.x, -position.y, position.z + playerHeight]}
				ref={ref}
			>
				<boxGeometry args={[1, 1, 2]} />
				<meshStandardMaterial color={color} />
			</mesh>
		</>
	);
};

export default Canvas;
