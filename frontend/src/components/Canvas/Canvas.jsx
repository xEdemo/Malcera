import { useRef, useEffect, useState, useLayoutEffect } from "react";

const tileWidth = 100,
	tileHeight = 100;
const gridRows = 10,
	gridColumns = 10;

const map = [
	[0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 2, 1, 0, 0, 0, 0, 1, 1],
	[0, 0, 0, 1, 1, 1, 1, 0, 1, 0],
	[0, 0, 0, 0, 2, 0, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
	[0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
	[0, 0, 0, 1, 0, 0, 1, 1, 1, 1],
	[0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
];
const playerX = 3;
const playerY = 3;
const playerRadius = 25;

const duration = 300; // speed of player animation in milliseconds

const Canvas = ({ isLeftSidebarOpen, isRightSidebarOpen }) => {
	const canvasRef = useRef(null);

	const [playerPosition, setPlayerPosition] = useState({
		x: playerX,
		y: playerY,
	});
	const [isPlayerAnimating, setIsPlayerAnimating] = useState(false);

	const drawMap = (context, offsetX, offsetY) => {
		context.fillStyle = "black";
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		for (let i = 0; i < gridRows; i++) {
			for (let j = 0; j < gridColumns; j++) {
				const tile = map[i][j];
				const x = j * tileWidth + offsetX;
				const y = i * tileHeight + offsetY;
				if (tile === 1) {
					context.fillStyle = "brown";
					context.fillRect(x, y, tileWidth, tileHeight);
				} else if (tile === 2) {
					context.fillStyle = "green";
					context.fillRect(x, y, tileWidth, tileHeight);
				} else {
					context.fillStyle = "gray";
					context.fillRect(x, y, tileWidth, tileHeight);
				}
			}
		}
	};

	const drawPlayer = (context, offsetX, offsetY) => {
		const x = playerPosition.x * tileWidth + offsetX;
		const y = playerPosition.y * tileHeight + offsetY;
		context.beginPath();
		context.fillStyle = "white";
		context.arc(
			x + tileWidth / 2,
			y + tileHeight / 2,
			playerRadius,
			0,
			Math.PI * 2
		);
		context.fill();
	};

	// const animate = (canvas, context) => {
	// 	const offsetX =
	// 		(canvas.width - tileWidth) / 2 - playerPosition.x * tileWidth;
	// 	const offsetY =
	// 		(canvas.height - tileHeight) / 2 - playerPosition.y * tileHeight;
	// 	drawMap(context, offsetX, offsetY); // Does not need to be called often
	// 	drawPlayer(canvas, context);
	// 	requestAnimationFrame(() => animate(canvas, context));
	// };

	const animatePlayer = (newX, newY) => {
		const start = { x: playerPosition.x, y: playerPosition.y };
		const end = { x: newX, y: newY };
		const startTime = performance.now();

		const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

		const updatePosition = (timestamp) => {
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1); // Ensure progress does not exceed 1

			const easedProgress = easeInOutQuad(progress);

			// Interpolate between start and end positions
			const interpolatedX = start.x + (end.x - start.x) * easedProgress;
			const interpolatedY = start.y + (end.y - start.y) * easedProgress;

			setPlayerPosition({ x: interpolatedX, y: interpolatedY });

			// Continue animating until duration is reached
			if (progress < 1) {
				requestAnimationFrame(updatePosition);
			} else {
				setIsPlayerAnimating(false); // Animation complete
			}
		};
		setIsPlayerAnimating(true);
		requestAnimationFrame(updatePosition);
	};

	const handleKeyDown = (event) => {
		if (isPlayerAnimating) return;

		let newX = playerPosition.x;
		let newY = playerPosition.y;

		switch (event.key) {
			case "a":
				newX = Math.max(0, playerPosition.x - 1);
				break;
			case "d":
				newX = Math.min(gridColumns - 1, playerPosition.x + 1);
				break;
			case "w":
				newY = Math.max(0, playerPosition.y - 1);
				break;
			case "s":
				newY = Math.min(gridRows - 1, playerPosition.y + 1);
				break;
			default:
				return;
		}
		// Check if the new position is valid (not a wall)
		if (map[newY][newX] === 1) {
			//setPlayerPosition({ x: newX, y: newY });
			animatePlayer(newX, newY);
		} else {
			// Play sounds or display a message
		}
	};

	const resizeCanvas = (canvas, context) => {
		const offsetX =
			(canvas.width - tileWidth) / 2 - playerPosition.x * tileWidth;
		const offsetY =
			(canvas.height - tileHeight) / 2 - playerPosition.y * tileHeight;
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		drawMap(context, offsetX, offsetY);
		drawPlayer(context, offsetX, offsetY);
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");

		window.addEventListener("resize", () => resizeCanvas(canvas, context));
		window.addEventListener("keydown", handleKeyDown);

		resizeCanvas(canvas, context);

		return () => {
			window.removeEventListener("resize", () => resizeCanvas(canvas, context));
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isLeftSidebarOpen, isRightSidebarOpen, playerPosition]);

	// Needed to render the position of camera and player properly
	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");
		resizeCanvas(canvas, context);
	}, [isLeftSidebarOpen, isRightSidebarOpen]);

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
