import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

const ChatBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const [ws, setWs] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);

    useEffect(() => {
        // `wss://url:${port}` for production
        const ws = new WebSocket(`ws://localhost:5000`);
        setWs(ws);

        ws.addEventListener('open', () => {
            console.log('WebSocket connection opened');
        });

        ws.addEventListener('message', handleMessage);

        return () => {
            ws.close(); // Close WebSocket connection when component unmounts
        };
    }, []);

    // Still needs to be tested
    const showOnlineUsers = (usersArray) => {
        // Only show one user per unique user id
        const users = {};
        usersArray.forEach(({ user }) => {
            users[user._id] = user.username;
            //console.log(user);
        });
        console.log(users);
        setOnlineUsers(users);
    };

    const handleMessage = (e) => {
        const messageData = JSON.parse(e.data);
        if ('online' in messageData) {
            showOnlineUsers(messageData.online);
        }
        if ('globalMessage' in messageData) {
            setMessages((prevMessages) => [
                ...prevMessages,
                messageData.globalMessage,
            ]);
        }
        //console.log(messageData);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            const globalMessage = {
                sender: userInfo.username,
                content: inputValue,
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour12: false,
                }), // Change this to server time eventually
            };

            ws.send(JSON.stringify({ globalMessage }));
            // Add the new message to the messages array
            // userInfo.username may need to get changed based on WebSocket data

            // Clear the input field
            setInputValue('');
        }
    };

    return (
        <>
            {/* Chat tabs Here maybe */}

            <div className="chat-box-container">
                <div className="chat-box-message-region">
                    {messages.map((message, index) => (
                        <p
                            key={index}
                            // this can be done with css but this is cooler :]
                            style={{
                                backgroundColor:
                                    index % 2 === 0 ? 'grey' : 'transparent',
                            }}
                        >
                            ({message.content.timestamp}){' '}
                            {message.content.sender}: {message.content.content}
                        </p>
                    ))}
                </div>
                <div className="chat-box-input-region">
                    <b>{userInfo?.username}:</b>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                </div>
            </div>
        </>
    );
};

export default ChatBox;
