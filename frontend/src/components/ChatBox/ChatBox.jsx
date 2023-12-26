import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

const ChatBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [ws, setWs] = useState(null);
    const [showChatBox, setShowChatBox] = useState(true); // For toggling chat box visibility
    const [showTimestamps, setShowTimestamps] = useState(true); // For toggling timestamps
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.user);
    const messagesContainerRef = useRef(null);

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

    useEffect(() => {
        // Scroll to the bottom when messages change
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, showChatBox]); // Add showChatBox as a dependency

    // Scroll to the bottom after the component has rendered
    useEffect(() => {
        if (messagesContainerRef.current && showChatBox) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [showChatBox]);

    const showOnlineUsers = (usersArray) => {
        const users = {};
        usersArray.forEach(({ user }) => {
            users[user._id] = user.username;
        });
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
    };

    const handleSend = () => {
        if (inputValue.trim() !== '') {
            const channelMessage = {
                sender: userInfo.username,
                content: inputValue,
                timestamp: new Date().toLocaleTimeString('en-US', {
                    hour12: false,
                }),
            };

            ws.send(JSON.stringify({ globalMessage: channelMessage }));
            setMessages((prevMessages) => [
                ...prevMessages,
                { content: channelMessage },
            ]);
            setInputValue('');
        }
    };

    const toggleChatBox = () => {
        setShowChatBox((prev) => !prev);
    };

    const openChatBox = () => {
        setShowChatBox(true);
    };

    const toggleTimestamps = () => {
        setShowTimestamps((prev) => !prev);
    };

    return (
        <>
            <div className={`chat-box-container ${showChatBox ? '' : 'hidden'}`}>
                {showChatBox && (
                    <div
                        className="chat-box-message-region"
                        ref={messagesContainerRef}
                    >
                        {messages.map((message, index) => (
                            <p
                                key={index}
                                style={{
                                    backgroundColor:
                                        index % 2 === 0 ? 'grey' : 'transparent',
                                }}
                            >
                                {message.content && (
                                    <>
                                        {showTimestamps && message.content.timestamp && (
                                            <span>({message.content.timestamp})</span>
                                        )}
                                        {' '}
                                        {message.content.sender && (
                                            <>
                                                {message.content.sender}: {message.content.content}
                                            </>
                                        )}
                                    </>
                                )}
                            </p>
                        ))}
                    </div>
                )}
                <div className="chat-box-input-region">
                    {showChatBox && (
                        <>
                            <b>{userInfo?.username}:</b>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === 'Button1') {
                                        handleSend();
                                    }
                                }}
                                maxLength={2} // Set the maximum number of characters
                            />
                        </>
                    )}
                    <button onClick={handleSend}>Send</button>
                    <button onClick={toggleChatBox}>
                        {showChatBox ? 'Hide Chat Box' : 'Open Chat Box'}
                    </button>
                    <button onClick={toggleTimestamps}>
                        {showTimestamps ? 'Hide Timestamps' : 'Show Timestamps'}
                    </button>
                </div>
            </div>
            {!showChatBox && (
                <button className="open-chat-box-button" onClick={openChatBox}>
                    Open Chat Box
                </button>
            )}
        </>
    );
};

export default ChatBox;
