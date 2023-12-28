import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const ChatBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const [showChatBox, setShowChatBox] = useState(true);
    const [showTimestamps, setShowTimestamps] = useState(true);
    const messagesContainerRef = useRef(null);

    const [ws, setWs] = useState(null);

    const [messageCount, setMessageCount] = useState(0);

    const [resizeState, setResizeState] = useState({
        resizing: false,
        startHeight: 0,
        startMouseY: 0,
    });
    const chatBoxContainerRef = useRef(null);
    const chatBoxTabContainerRef = useRef(null);
    const tabContainerBottomRef = useRef(null);
    const [chatBoxHeight, setChatBoxHeight] = useState();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);

    useEffect(() => {
        // rate limiter logic
        const messageTimer = setInterval(() => {
            setMessageCount(0); // Reset message count every minute
        }, 60000);

        return () => {
            clearInterval(messageTimer);
        };
    }, []);

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
        const lastMessage = messagesContainerRef.current.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, showChatBox, resizeState]);

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

    const handleSend = (e) => {
        if (inputValue.trim() !== '') {
            // Check message count before sending
            if (messageCount < 20) {
                const globalMessage = {
                    sender: userInfo.username,
                    content: inputValue,
                    timestamp: new Date().toLocaleTimeString('en-US', {
                        hour12: false,
                    }),
                };

                ws.send(JSON.stringify({ globalMessage }));
                // Increment message count
                setMessageCount((prevCount) => prevCount + 1);

                setInputValue('');
            } else {
                toast.error('Message limit exceeded. Wait for a minute.');
            }
        }
    };

    const handleResizeStart = (e) => {
        setResizeState({
            resizing: true,
            startHeight: chatBoxContainerRef.current.clientHeight,
            startMouseY: e.clientY,
        });
    };

    const handleDuringResize = (e) => {
        if (resizeState.resizing) {
            const newHeight =
                resizeState.startHeight + (resizeState.startMouseY - e.clientY);

            // Check for minimum height
            const minHeight = 72; // Adjust this value as needed
            const maxHeight = window.innerHeight * 0.749; // Adjust this value as needed
            const clampedHeight = Math.max(
                minHeight,
                Math.min(newHeight, maxHeight)
            );

            // Update the chat box height in the state
            setChatBoxHeight(clampedHeight);
        }
    };

    useLayoutEffect(() => {
        // Initial position setup
        if (showChatBox && chatBoxTabContainerRef.current) {
            // Set the chat box height
            chatBoxContainerRef.current.style.height = `${chatBoxHeight}px`;

            // Use getBoundingClientRect to get the most up-to-date position
            const tabContainerRect =
                chatBoxTabContainerRef.current.getBoundingClientRect();

            // Calculate the bottom position for chat-box-tab-container
            const tabContainerBottom =
                chatBoxHeight + tabContainerRect.height - 36.38;

            // Ensure the tab container stays within the limits
            const maxTabContainerBottom =
                window.innerHeight - tabContainerRect.height;
            chatBoxTabContainerRef.current.style.bottom = `${Math.min(
                tabContainerBottom,
                maxTabContainerBottom
            )}px`;
        }
    }, [showChatBox, chatBoxHeight]);

    useEffect(() => {
        window.addEventListener('mousemove', handleDuringResize);
        window.addEventListener('mouseup', handleResizeEnd);

        return () => {
            window.removeEventListener('mousemove', handleDuringResize);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [resizeState]);

    const handleResizeEnd = () => {
        setResizeState((prevState) => ({
            ...prevState,
            resizing: false,
        }));
    };

    const toggleChatBox = () => {
        setShowChatBox(!showChatBox);
    };

    const toggleTimestamps = () => {
        setShowTimestamps(!showTimestamps);
    };

    return (
        <>
            {showChatBox && (
                <div
                    className="chat-box-tab-container"
                    ref={chatBoxTabContainerRef}
                >
                    <div className="chat-box-tabs">
                        <p>Global</p>
                        <p>English</p>
                        <p>Placeholder Tab 3</p>
                        <p>Placeholder Tab 4</p>
                        <p>Placeholder Tab 5</p>
                        <p>Placeholder Tab 6</p>
                        <p>Placeholder Tab 7</p>
                        <p>Placeholder Tab 8</p>
                    </div>
                    <div
                        onClick={toggleChatBox}
                        className="chat-box-close"
                    ></div>
                </div>
            )}
            
            <div
                className={`chat-box-container ${
                    showChatBox ? '' : 'hidden-chat-box'
                }`}
                ref={chatBoxContainerRef}
            >
                <div
                    className="chat-box-resize-handle"
                    onMouseDown={handleResizeStart}
                ></div>
                <div
                    className="chat-box-message-region"
                    ref={messagesContainerRef}
                >
                    {messages.map((message, index) => (
                        <p
                            key={index}
                            // this can be done with css as well
                            style={{
                                backgroundColor:
                                    index % 2 === 0 ? '#0a0a0a' : 'transparent',
                            }}
                        >
                            {message.content && (
                                <>
                                    {showTimestamps &&
                                        message.content.timestamp && (
                                            <span
                                                style={{
                                                    display: 'inline-block',
                                                    width: '80.25px',
                                                }}
                                            >
                                                ({message.content.timestamp})
                                            </span>
                                        )}{' '}
                                    {message.content.sender && (
                                        <>
                                            {message.content.sender}:{' '}
                                            {message.content.content}
                                        </>
                                    )}
                                </>
                            )}
                        </p>
                    ))}
                </div>

                <div className="chat-box-input-container">
                    <b>{userInfo?.username}:</b>
                    <div className="chat-box-input-region">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Button1') {
                                    handleSend();
                                }
                            }}
                            maxLength={100}
                        />
                        <div onClick={handleSend}>
                            <span>&#10148;</span>
                        </div>
                    </div>
                    <button onClick={toggleTimestamps}>
                        {showTimestamps ? 'HideT' : 'ShowT'}
                    </button>
                </div>
            </div>

            {!showChatBox && (
                <button
                    className="open-chat-box-button"
                    onClick={toggleChatBox}
                >
                    Open Chat Box
                </button>
            )}
        </>
    );
};

export default ChatBox;
