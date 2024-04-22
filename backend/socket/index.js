const ws = require("ws");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models");

const initWebSocket = (server) => {
	const wss = new ws.Server({ server });

	const playerPositions = {};

	wss.on(
		"connection",
		asyncHandler(async (connection, req) => {
			const cookies = req.headers.cookie;
			if (cookies) {
				const tokenCookieString = cookies
					.split(";")
					.find((string) => string.startsWith("jwt="));
				if (tokenCookieString) {
					const token = tokenCookieString.split("=")[1];
					if (token) {
						try {
							const decoded = jwt.verify(
								token,
								process.env.JWT_SECRET
							);
							req.user = await User.findById(
								decoded.userId
							).select("-password -__v");
							if (req.user) {
								connection.users = req.user;
								//console.log(connection.users);
							}
						} catch (error) {
							throw new Error("Not authorized. Invalid token.");
						}
					}
				}
			}
			//console.log([...wss.clients].map(c => c.users.username));
			[...wss.clients].forEach((client) => {
				client.send(
					JSON.stringify({
						online: [...wss.clients].map((c) => ({
							user: c.users,
						})),
					})
				);
			});

			connection.on("message", (message) => {
				try {
					// Parse the incoming message
					const parsedMessage = JSON.parse(message);
					//console.log(parsedMessage.type);

					if (parsedMessage.type === "playerMove") {
						// Handle player movement
						const { x, y, map } = parsedMessage.payload;
						updatePlayerPosition(connection, x, y, map);
					} else {
						// Handle other types of messages
						handleIncomingMessage(parsedMessage, connection);
					}
				} catch (error) {
					console.error(
						"Error parsing or handling incoming message:",
						error
					);
				}
			});
		})
	);

	const handleIncomingMessage = (message, senderConnection) => {
		if (message && message.globalMessage) {
			const globalMessage = {
				badge: senderConnection.users?.role,
				sender: senderConnection.users?.username,
				content: message.globalMessage,
			};

			// Broadcast the global message to all clients
			[...wss.clients].forEach((client) => {
				client.send(JSON.stringify({ globalMessage }));
			});
		}
	};

	const handlePlayerPositions = () => {
		const positions = Object.entries(playerPositions).map(
			([id, { x, y, map }]) => ({
				id,
				x,
				y,
                map,
			})
		);

		[...wss.clients].forEach((client) => {
			client.send(JSON.stringify({ playerPositions: positions }));
		});
	};

	const updatePlayerPosition = (connection, newX, newY, map) => {
		playerPositions[connection.users?._id] = { x: newX, y: newY, map };
		handlePlayerPositions();
	};
};

module.exports = initWebSocket;
