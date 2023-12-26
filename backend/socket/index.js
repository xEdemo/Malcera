const ws = require('ws');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models');

const initWebSocket = (server) => {
    const wss = new ws.Server({server});

    wss.on(
        'connection',
        asyncHandler(async (connection, req) => {
            const cookies = req.headers.cookie;
            if (cookies) {
                const tokenCookieString = cookies
                    .split(';')
                    .find((string) => string.startsWith('jwt='));
                if (tokenCookieString) {
                    const token = tokenCookieString.split('=')[1];
                    if (token) {
                        try {
                            const decoded = jwt.verify(
                                token,
                                process.env.JWT_SECRET
                            );
                            req.user = await User.findById(
                                decoded.userId
                            ).select('-password -__v');
                            if (req.user) {
                                connection.users = req.user;
                                // Broadcast the user who just connected
                                broadcastOnlineUsers();
                            }
                        } catch (error) {
                            throw new Error('Not authorized. Invalid token.');
                        }
                    }
                }
            }

            connection.on('message', (message) => {
                try {
                    const parsedMessage = JSON.parse(message);
                    handleIncomingMessage(parsedMessage, connection);
                } catch (error) {
                    console.error('Error parsing incoming message:', error);
                }
            });

            connection.on('close', () => {
                // Broadcast the user who just disconnected
                broadcastOnlineUsers();
            });
        })
    );

    const broadcastOnlineUsers = () => {
        [...wss.clients].forEach((client) => {
            client.send(
                JSON.stringify({
                    online: [...wss.clients].map((c) => ({
                        user: c.users,
                    })),
                })
            );
        });
    };

    const handleIncomingMessage = (message, senderConnection) => {
        if (message && message.globalMessage) {
            const globalMessage = {
                sender: senderConnection.users.username,
                content: message.globalMessage.content,
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                }),
            };

            // Broadcast the global message to all clients
            [...wss.clients].forEach((client) => {
                client.send(JSON.stringify({globalMessage}));
            });
        }
    };
}

    module.exports = initWebSocket;
