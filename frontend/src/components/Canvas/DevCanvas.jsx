import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles, Sky, Stars } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import { maps, tileWidth, tileLength, gridRows, gridColumns } from "./maps.js";
import { isWalkable } from "./pathing.js";
import { useDispatch } from "react-redux";
import * as THREE from 'three';

const DevCanvas = ({ userData }) => {
	const [selectedMap, setSelectedMap] = useState("tutorial");
	return (
		<div style={{ padding: "10px" }}>
			<Canvas
				style={{
					width: "100%",
					height: "calc(100vh - 126px)",
				}}
			>
				<Sky sunPosition={[0, 0, 0]} distance={4500} />
				<Stars
					radius={150}
					depth={50}
					count={4000}
					factor={3}
					fade
					speed={1}
				/>
				<ambientLight intensity={0.4} />
				<pointLight castShadow intensity={100} position={[0, -10, 10]} />
				{maps[selectedMap].map((row, rowIndex) =>
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
							userData={userData}
						/>
					))
				)}
				<OrbitControls />
			</Canvas>
		</div>
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

const Tile = ({ position, color, userData }) => {
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
				userData.world.position.x,
				userData.world.position.y,
				maps[userData.world.currentMap][userData.world.position.y][
					userData.world.position.x
				].z,
				position[0],
				Math.abs(position[1]),
				position[2],
				maps[userData.world.currentMap]
			)
		) {
			setIsTileHovered(true);
		}
	};

	const handlePointerDown = (e) => {
		e.stopPropagation();
		if (
			isWalkable(
				userData.world.position.x,
				userData.world.position.y,
				maps[userData.world.currentMap][userData.world.position.y][
					userData.world.position.x
				].z,
				position[0],
				Math.abs(position[1]),
				position[2],
				maps[userData.world.currentMap]
			)
		) {
			setIsTileClicked(true);
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
			{isTileClicked && (
				<>
					<mesh>
						<Chevron position={[0, 0, 100]} />
					</mesh>
				</>
			)}
		</group>
	);
};

export default DevCanvas;
