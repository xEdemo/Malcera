// Breadth-First Search
export const isWalkable = (
	startX,
	startY,
	startZ,
	targetX,
	targetY,
	targetZ,
	map,
) => {
	if (map[targetY][targetX].v <= 0) return false;

	const directions = [
		[0, 1],
		[1, 0],
		[0, -1],
		[-1, 0],
	];

	const isValidTile = (x, y, currentZ) =>
		map[y] &&
		map[y][x] &&
		map[y][x].v > 0 &&
		Math.abs(map[y][x].z - currentZ) <= 1;

	const queue = [[startX, startY, startZ]];
	const visited = new Set();
	visited.add(`${startX},${startY},${startZ}`);

	while (queue.length > 0) {
		const [x, y, z] = queue.shift();

		if (x === targetX && y === targetY && Math.abs(z - targetZ) <= 1) {
			return true;
		}

		for (const [dx, dy] of directions) {
			const newX = x + dx;
			const newY = y + dy;
			const newZ = map[newY] && map[newY][newX] ? map[newY][newX].z : z;

			if (
				isValidTile(newX, newY, z) &&
				!visited.has(`${newX},${newY},${newZ}`)
			) {
				visited.add(`${newX},${newY},${newZ}`);
				queue.push([newX, newY, newZ]);
			}
		}
	}

	return false;
};

// A* Search
export const findPath = (start, goal, map) => {
	const directions = [
		[0, 1],
		[1, 0],
		[0, -1],
		[-1, 0],
	];

	const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

	const isValidTile = (x, y, currentZ) =>
		map[y] &&
		map[y][x] &&
		map[y][x].v > 0 &&
		Math.abs(map[y][x].z - currentZ) <= 1;

	const startNode = {
		position: start,
		cost: 0,
		estimatedTotalCost: heuristic(start, goal),
		previous: null,
	};

	const openList = [startNode];
	const closedList = new Set();
	closedList.add(`${start[0]},${start[1]},${start[2]}`);

	while (openList.length > 0) {
		openList.sort((a, b) => a.estimatedTotalCost - b.estimatedTotalCost);
		const currentNode = openList.shift();

		const [x, y, z] = currentNode.position;

		if (x === goal[0] && y === goal[1] && Math.abs(z - goal[2]) <= 1) {
			const path = [];
			let node = currentNode;
			while (node) {
				path.push(node.position);
				node = node.previous;
			}
			return path.reverse();
		}

		for (const [dx, dy] of directions) {
			const newX = x + dx;
			const newY = y + dy;
			const newZ = map[newY] && map[newY][newX] ? map[newY][newX].z : z;

			if (
				isValidTile(newX, newY, z) &&
				!closedList.has(`${newX},${newY},${newZ}`)
			) {
				const newNode = {
					position: [newX, newY, newZ],
					cost: currentNode.cost + 1,
					estimatedTotalCost:
						currentNode.cost + 1 + heuristic([newX, newY], goal),
					previous: currentNode,
				};

				openList.push(newNode);
				closedList.add(`${newX},${newY},${newZ}`);
			}
		}
	}

	return [];
}
