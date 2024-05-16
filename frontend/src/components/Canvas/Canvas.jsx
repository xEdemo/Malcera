import {
	useRef,
	useEffect,
	useState,
	useCallback,
} from "react";
import { maps, tileWidth, tileHeight, gridRows, gridColumns } from "./maps.js";
import { useSelector, useDispatch } from "react-redux";
import { useUpdatePositionMutation } from "../../slices/updateUser/updateUserApiSlice.js";
import { updateUserPosition, updateUserMap } from '../../slices/user/userSlice.js';
import { toast } from "react-toastify";
import terrainss from "../../assets/sprites/terrain/terrainss.png";

const playerRadius = 25;

const duration = 20; // speed of player animation (frames)

let movementFrameCount = 1;

const imageHeight = 100, imageWidth = 100;

const Canvas = ({ isLeftSidebarOpen, isRightSidebarOpen }) => {
	const canvasRef = useRef(null);

	const dispatch = useDispatch();

	const { userInfo } = useSelector((state) => state.auth);

	const currentMapRef = useRef(userInfo.currentMap);
	const [preloadedMaps, setPreloadedMaps] = useState({});
	const imageRef = useRef(null)

	const playerPositionRef = useRef({
		x: userInfo.position.x,
		y: userInfo.position.y,
	});

	const newXRef = useRef(playerPositionRef.current.x);
	const newYRef = useRef(playerPositionRef.current.y);
	const isPlayerAnimatingRef = useRef(false);

	const [ws, setWs] = useState(null);
	const otherPlayersRef = useRef([]); // also includes player

	const hoveredTileRef = useRef({
		x: null,
		y: null,
	});

	const [wsReadyState, setWsReadyState] = useState(0);

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
	}

	// Need to optimize this function so that it does not redraw all maps that any player may be at
	// Ex: if a player is on limbo and if a player is on tutorial and the player moves on limbo, it will redraw the map for the player on tutorial 20 times
	useEffect(() => {
		const preloadMaps = async () => {
			const preloaded = {};
			for (const mapName of Object.keys(maps)) {
				const map = maps[mapName];
				preloaded[mapName] = map;
			}

			const img = new Image();
			img.src = terrainss;
			img.onload = () => imageRef.current = img;
			
			setPreloadedMaps(preloaded);
		};

		preloadMaps();

		return () => {};
	}, []);

	const drawMap = (context, offsetX, offsetY) => {
		const map = preloadedMaps[currentMapRef.current];
		if (map && imageRef.current) {
			// console.log(map);
			context.fillStyle = "black";
			context.fillRect(0, 0, context.canvas.width, context.canvas.height);
			for (let i = 0; i < gridRows; i++) {
				for (let j = 0; j < gridColumns; j++) {
					const tile = map[i][j];
					const x = j * tileWidth + offsetX;
					const y = i * tileHeight + offsetY;

					context.strokeStyle = "white";
					context.lineWidth = 1;
					context.strokeRect(x, y, tileWidth, tileHeight);

					// Draw individual tiles
					if (tile === 1) {
						// context.fillStyle = "brown";
						// context.fillRect(x, y, tileWidth, tileHeight);
						context.drawImage(imageRef.current, imageWidth * 0, imageHeight * 0, imageWidth, imageHeight, x, y, tileWidth, tileHeight);
					} else if (tile === 2) {
						context.drawImage(imageRef.current, imageWidth * 1, imageHeight * 0, imageWidth, imageHeight, x, y, tileWidth, tileHeight)
					} else if (tile === 900 || tile === 901) {
						context.fillStyle = "black";
						context.fillRect(x, y, tileWidth, tileHeight);
					} else {
						context.fillStyle = "gray";
						context.fillRect(x, y, tileWidth, tileHeight);
					}

					// Draw the gold border for the hovered tile
					if (
						i === hoveredTileRef.current.y &&
						j === hoveredTileRef.current.x
					) {
						context.strokeStyle = "gold";
						context.lineWidth = 2;
						context.strokeRect(x, y, tileWidth - 1, tileHeight - 1);
					}
				}
			}
		}
	};

	const clearHoveredTile = (canvas) => {
		hoveredTileRef.current = {
			x: null,
			y: null,
		};
		canvas.style.cursor = "default";
	}

	const handleMouseHover = (canvas, context, e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const offsetX =
			(canvas.width - tileWidth) / 2 -
			playerPositionRef.current.x * tileWidth;
		const offsetY =
			(canvas.height - tileHeight) / 2 -
			playerPositionRef.current.y * tileHeight;

		const tileX = Math.floor((x - offsetX) / tileWidth);
		const tileY = Math.floor((y - offsetY) / tileHeight);

		const map = preloadedMaps[currentMapRef.current];
		if (map && map[tileY] && map[tileY][tileX]) {
			const checkHoveredTile = map[tileY][tileX];
			//console.log(hoveredTile);
			if (checkHoveredTile !== 0) {
				hoveredTileRef.current = {
					x: tileX,
					y: tileY,
				};
				canvas.style.cursor = "pointer";
			}
		} else {
			clearHoveredTile(canvas);
		}
	};

	const handleTileClick = () => {
        // You can do whatever you want here, such as logging a message to console
		if (hoveredTileRef.current.x !== null && hoveredTileRef.current.y !== null) {
			console.log("Clicked on highlighted tile at:", hoveredTileRef.current);
		}
    };

	const drawOtherPlayers = (context, offsetX, offsetY) => {
		//console.log("otherPlayer state in drawOtherPlayers:", otherPlayers);
		if (otherPlayersRef.current) {
			otherPlayersRef.current
				.filter((player) => player.map === currentMapRef.current)
				.forEach((player) => {
					const x = player.x * tileWidth + offsetX;
					const y = player.y * tileHeight + offsetY;
					if (player.id === userInfo._id) {
						context.fillStyle = "blue";
					} else {
						context.fillStyle = "green";
					}
					context.beginPath();
					context.arc(
						x + tileWidth / 2,
						y + tileHeight / 2,
						playerRadius,
						0,
						Math.PI * 2
					);
					context.fill();
				});
		}
	};

	const animateGame = useCallback(
		(canvas, context) => {
			const offsetX =
				(canvas.width - tileWidth) / 2 -
				playerPositionRef.current.x * tileWidth;
			const offsetY =
				(canvas.height - tileHeight) / 2 -
				playerPositionRef.current.y * tileHeight;
			drawMap(context, offsetX, offsetY);
			drawOtherPlayers(context, offsetX, offsetY);
			if (ws) {
				if (isPlayerAnimatingRef.current) {
					const start = {
						x: playerPositionRef.current.x,
						y: playerPositionRef.current.y,
					};
					const end = { x: newXRef.current, y: newYRef.current };

					const easeInOutQuad = (t) =>
						t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

					const updatePosition = () => {
						const progress = Math.min(movementFrameCount / duration, 1); // Ensure progress does not exceed 1

						const easedProgress = easeInOutQuad(progress);

						// Interpolate between start and end positions
						const interpolatedX =
							start.x + (end.x - start.x) * easedProgress;
						const interpolatedY =
							start.y + (end.y - start.y) * easedProgress;

						playerPositionRef.current = {
							x: interpolatedX,
							y: interpolatedY,
						};
						ws.send(
							JSON.stringify({
								type: "playerMove",
								payload: {
									x: interpolatedX,
									y: interpolatedY,
									map: currentMapRef.current,
								},
							})
						);

						if (progress >= 1) {
							movementFrameCount = 1;
							isPlayerAnimatingRef.current = false;
							//Update DB on completion
							updatePositionDB(interpolatedX, interpolatedY, "");
							//console.log(currentMapRef.current);
						} else {
							movementFrameCount++;
							//console.log(progress);
						}
					};
					updatePosition();
				}
			}
			requestAnimationFrame(() => animateGame(canvas, context));
		},
		[isPlayerAnimatingRef, otherPlayersRef, ws]
	);

	const handleKeyDown = (e) => {
		if (isPlayerAnimatingRef.current) return;

		let newX = playerPositionRef.current.x;
		let newY = playerPositionRef.current.y;
		switch (e.key) {
			case "a":
				newX = Math.max(0, playerPositionRef.current.x - 1);
				break;
			case "d":
				newX = Math.min(
					gridColumns - 1,
					playerPositionRef.current.x + 1
				);
				break;
			case "w":
				newY = Math.max(0, playerPositionRef.current.y - 1);
				break;
			case "s":
				newY = Math.min(gridRows - 1, playerPositionRef.current.y + 1);
				break;
			default:
				return;
		}
		if (preloadedMaps[currentMapRef.current][newY][newX]) {
			clearHoveredTile(canvasRef.current);
		}
		// Check if the new position is valid (not a wall)
		if (preloadedMaps[currentMapRef.current][newY][newX] >= 1 && preloadedMaps[currentMapRef.current][newY][newX] < 900) {
			newXRef.current = newX;
			newYRef.current = newY;
			//animatePlayer(newX, newY);
			isPlayerAnimatingRef.current = true;
		} else if (preloadedMaps[currentMapRef.current][newY][newX] === 900) {
			currentMapRef.current = "limbo";
			playerPositionRef.current = {
				x: 18,
				y: 18,
			};
			ws.send(
				JSON.stringify({
					type: "playerMove",
					payload: { x: 18, y: 18, map: "limbo" },
				})
			);
			updatePositionDB(18, 18, "limbo");
			// Update position in database and map in database
		} else if (preloadedMaps[currentMapRef.current][newY][newX] === 901) {
			currentMapRef.current = "tutorial";
			playerPositionRef.current = {
				x: 1,
				y: 18,
			};
			ws.send(
				JSON.stringify({
					type: "playerMove",
					payload: { x: 1, y: 18, map: "tutorial" },
				})
			);
			updatePositionDB(1, 18, "tutorial");
			// Update position in database and map in database
		} else {
			// Play sounds or display a message
		}
	};

	const resizeCanvas = (canvas, context) => {
		const offsetX =
			(canvas.width - tileWidth) / 2 -
			playerPositionRef.current.x * tileWidth;
		const offsetY =
			(canvas.height - tileHeight) / 2 -
			playerPositionRef.current.y * tileHeight;
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		drawMap(context, offsetX, offsetY);
		drawOtherPlayers(context, offsetX, offsetY);
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
				otherPlayersRef.current = data.playerPositions;
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

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");

		window.addEventListener("resize", () => resizeCanvas(canvas, context));
		window.addEventListener("keydown", handleKeyDown);
		canvas.addEventListener("mousemove", (e) =>
			handleMouseHover(canvas, context, e)
		);
		canvas.addEventListener("click", handleTileClick);

		resizeCanvas(canvas, context);

		return () => {
			window.removeEventListener("resize", () =>
				resizeCanvas(canvas, context)
			);
			window.removeEventListener("keydown", handleKeyDown);
			canvas.removeEventListener("mousemove", (e) =>
				handleMouseHover(canvas, context, e)
			);
			canvas.removeEventListener("click", handleTileClick);
		};
		// Added preloadedMaps so that edge browser will render in the player
	}, [isLeftSidebarOpen, isRightSidebarOpen, ws, preloadedMaps]);

	// Only animates the game once ws is loaded
	useEffect(() => {
		if (ws) {
			animateGame(canvasRef.current, canvasRef.current.getContext("2d"));
			setTimeout(() => {
				setWsReadyState(1);
			}, 75)
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
						map: currentMapRef.current,
					},
				})
			);
		}
	}, [wsReadyState]);


	return (
		<div style={{ padding: "10px" }}>
			<canvas
				ref={canvasRef}
				style={{
					width: "100%",
					height: "calc(100vh - 126px)",
					backgroundColor: "black",
				}}
			/>
		</div>
	);
};
export default Canvas;
