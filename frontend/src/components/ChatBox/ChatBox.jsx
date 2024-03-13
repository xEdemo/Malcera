import { useState, useEffect, useRef, useLayoutEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChatBoxContextMenu, useChatBoxContextMenu } from '../../components';
import { toast } from 'react-toastify';
import { Cog6ToothIcon as OutlineCog6ToothIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const ChatBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const [showChatBox, setShowChatBox] = useState(true);
    const [showTimestamps, setShowTimestamps] = useState(
        JSON.parse(localStorage.getItem('SHOW_TIMESTAMPS')) || false
    );

    const [showOptionsMenu, setShowOptionsMenu] = useState(false);

    const messagesContainerRef = useRef(null);

    const [ws, setWs] = useState(null);

    const [messageCount, setMessageCount] = useState(0);
    const [messageTimer, setMessageTimer] = useState(null);

    const [resizeState, setResizeState] = useState({
        resizing: false,
        startHeight: 0,
        startMouseY: 0,
    });
    const chatBoxContainerRef = useRef(null);
    const chatBoxTabContainerRef = useRef(null);
    const [chatBoxHeight, setChatBoxHeight] = useState();
    const [overlayHeight, setOverlayHeight] = useState();

    const { contextMenu, showContextMenu } = useChatBoxContextMenu();
    const [contextUsername, setContextUsername] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);

    const toggleOptionsMenu = () => {
        setShowOptionsMenu(!showOptionsMenu);
    };

    const toggleChatBox = () => {
        setShowChatBox(!showChatBox);
    };

    const toggleTimestamps = () => {
        const newValue = !showTimestamps;
        setShowTimestamps(newValue);
        // Save the choice in local storage
        localStorage.setItem('SHOW_TIMESTAMPS', JSON.stringify(newValue));
    };

    const parseLink = (message) => {
        const messageContent = message.content.content;
        const linkRegex =
            /(?:https?:\/\/)?(?:www\.)?(\S+\.[a-zA-Z]{2,}(?:[^\s.,;!?()]|$))/gi;
        const linkedContent = messageContent
            .split(linkRegex)
            .map((part, index, array) => {
                if (index % 2 === 1) {
                    // Apply link to the matched part
                    return (
                        <a
                            key={index}
                            href={`https://www.${part}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {part}
                        </a>
                    );
                } else {
                    // Display the text before the link
                    return part;
                }
            });

        return {
            ...message,
            content: {
                ...message.content,
                content: linkedContent,
            },
        };
    };

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
            const parsedMessage = parseLink(messageData.globalMessage);
            setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        }
    };

    const handleSend = () => {
        if (inputValue.trim() !== '') {
            // Continue with sending the message
            if (messageCount === 0) {
                // Start the message timer
                const timer = setInterval(() => {
                    setMessageCount(0);
                    clearInterval(timer); // Reset and clear the timer after a minute
                }, 60000);
                setMessageTimer(timer);
            }

            // Check message count before sending
            if (messageCount < 20) {
                const now = new Date();

                // Get UTC time string in HH:mm:ss format
                const utcTimeString = now
                    .toISOString()
                    .split('T')[1]
                    .slice(0, 8);

                const globalMessage = {
                    badge: userInfo.role,
                    sender: userInfo.username,
                    content: inputValue,
                    timestamp: utcTimeString,
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
        if (e.key !== 'Button2') {
            setResizeState({
                resizing: true,
                startHeight: chatBoxContainerRef.current.clientHeight,
                startMouseY: e.clientY,
            });
        }
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

            const overlayHeight = chatBoxHeight + 36.38;

            setOverlayHeight(overlayHeight);
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

    useEffect(() => {
        // Clear the message timer when the component unmounts
        return () => {
            if (messageTimer) {
                clearInterval(messageTimer);
            }
        };
    }, [messageTimer]);

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

    useEffect(() => {
        if (contextMenu.index !== undefined) {
            const usersUsername = messages[contextMenu.index]?.content?.sender;
            if (usersUsername) {
                setContextUsername(usersUsername);
            }
        }
    }, [contextMenu]);

    return (
        <>
            <ChatBoxContextMenu 
                contextMenu={contextMenu} 
                contextUsername={contextUsername} 
            />
            {showOptionsMenu && (
                <div
                    className="chat-box-overlay"
                    style={{ height: `${overlayHeight}px` }}
                >
                    <div className="chat-box-options-toolbar">
                        <p>Chat Box Options:</p>
                        <div
                            onClick={toggleOptionsMenu}
                            className="chat-box-close-overlay"
                        ></div>
                    </div>
                    <div
                        className="chat-box-resize-handle"
                        onMouseDown={handleResizeStart}
                    ></div>
                    <div className="chat-box-options-container">
                        <div>
                            <p>Timestamps:</p>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="timestamps"
                                        checked={showTimestamps}
                                        onChange={toggleTimestamps}
                                    />{' '}
                                    Show
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="timestamps"
                                        checked={!showTimestamps}
                                        onChange={toggleTimestamps}
                                    />{' '}
                                    Hide
                                </label>
                            </div>
                        </div>
                        <div>
                            <p>Name Plate Color:</p>
                            <div>
                                <select>
                                    <option>Blue</option>
                                    <option>Green</option>
                                    <option>Purple</option>
                                    <option>Red</option>
                                    {userInfo?.role !== 'user' && (
                                        <>
                                            <option>Gradient</option>
                                            <option>Transparent</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div>
                            <p>Mute Alerts:</p>
                            <div>Options</div>
                        </div>
                        <div>
                            <p>New Option Here:</p>
                            <div>Options</div>
                        </div>
                        <div>
                            <p>New Option Here:</p>
                            <div>Options</div>
                        </div>
                        <div>
                            <p>New Option Here:</p>
                            <div>Options</div>
                        </div>
                        <div>
                            <p>New Option Here:</p>
                            <div>Options</div>
                        </div>
                    </div>
                </div>
            )}

            {showChatBox && (
                <div
                    className="chat-box-tab-container"
                    ref={chatBoxTabContainerRef}
                >
                    <div className="chat-box-tabs">
                        <p>Global</p>
                        <p>English</p>
                        <p>Private</p>
                        <p>Events</p>
                        <p>Area</p>
                        <p>Placeholder</p>
                        <p>Placeholder</p>
                        <p>Placeholder</p>
                        <p>Placeholder</p>
                        <p>Placeholder</p>
                        <p>Placeholder</p>
                    </div>
                    <div
                        onClick={toggleOptionsMenu}
                        className="chat-box-options-cog"
                    >
                        <OutlineCog6ToothIcon />
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
                                                    width: '60.25px',
                                                }}
                                            >
                                                ({message.content.timestamp})
                                            </span>
                                        )}{' '}
                                    {message.content.sender && (
                                        <>
                                            {message.content.badge ===
                                                'forumMod' && (
                                                <StarIcon className="chat-box-badges forum-mod-badge" title='Forum Moderator' />
                                            )}{' '}
                                            {message.content.badge ===
                                                'playerMod' && (
                                                <StarIcon className="chat-box-badges player-mod-badge" title='Player Moderator' />
                                            )}{' '}
                                            {message.content.badge ===
                                                'admin' && (
                                                <StarIcon className="chat-box-badges admin-badge" title='Administrator' />
                                            )}{' '}
                                            {message.content.badge ===
                                                'superAdmin' && (
                                                <StarIcon className="chat-box-badges super-admin-badge" title='God' />
                                            )}{' '}
                                            <span
                                                className="chat-box-sender-username"
                                                onContextMenu={(e) =>
                                                    showContextMenu(index, e)
                                                }
                                            >
                                                {message.content.sender}
                                            </span>
                                            : {message.content.content}
                                        </>
                                    )}
                                </>
                            )}
                        </p>
                    ))}
                </div>

                <div className="chat-box-input-container">
                    {userInfo?.role === 
                        'forumMod' && (
                        <StarIcon className="chat-box-badges forum-mod-badge" title='Forum Moderator' />
                    )}{' '}
                    {userInfo?.role === 
                        'playerMod' && (
                            <StarIcon className="chat-box-badges player-mod-badge" title='Player Moderator' />
                    )}{' '}
                    {userInfo?.role === 
                        'admin' && (
                            <StarIcon className="chat-box-badges admin-badge" title='Administrator' />
                    )}{' '}
                    {userInfo?.role === 
                        'superAdmin' && (
                            <StarIcon className="chat-box-badges super-admin-badge" title='God' />
                    )}{' '}
                    <b>{userInfo?.username}:</b>
                    <div className="chat-box-input-region">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                const newText = e.target.value;
                                setInputValue(newText);
                            }}
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

export default memo(ChatBox);