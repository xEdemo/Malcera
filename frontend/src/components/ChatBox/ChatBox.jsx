import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Filter from 'bad-words';
// import Typo from 'typo-js';

const ChatBox = pattern => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const [showChatBox, setShowChatBox] = useState(true);
    const [showTimestamps, setShowTimestamps] = useState(true);
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

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);
    const filter = new Filter();

    // let dictionary;
    //
    // // Function to load the dictionary
    // useEffect(() => {
    //     // Load the dictionary when the component mounts
    //     const loadDictionary = async () => {
    //         dictionary = await new Typo('en_US');
    //     };
    //
    //     loadDictionary();
    //
    //     // ... (rest of your existing useEffect logic)
    // }, []);
    //
    // // Function to check if the dictionary is loaded
    // const isDictionaryLoaded = () => {
    //     return !!dictionary;
    // };
    //
    // // Function to check if a word is misspelled
    // const isMisspelled = (word) => {
    //     return isDictionaryLoaded() ? !dictionary.check(word) : false;
    // };
    //
    // useEffect(() => {
    //     // Clear the message timer when the component unmounts
    //     return () => {
    //         if (messageTimer) {
    //             clearInterval(messageTimer);
    //         }
    //     };
    // }, [messageTimer]);




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
            const parsedMessage = parseMessage(messageData.globalMessage);
            setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        }
    };

    const parseMessage = (message) => {
        const messageContent = message.content.content;
        const linkRegex =
            /(?:https?:\/\/)?(?:www\.)?(\S+\.[a-zA-Z]{2,}(?:[^\s.,;!?()]|$))/gi;
        const linkedContent = messageContent
            .split(linkRegex)
            .map((part, index, array) => {
                if (index % 2 === 1) {
                    // Apply link to the matched part
                    console.log(part);
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

    const handleSend = () => {
        if (inputValue.trim() !== '') {
            // Check for profanity
            const filteredContent = filter.clean(inputValue);

            // Check if the content was changed
            if (filteredContent !== inputValue) {
                // Handle profanity violation (e.g., warn the user, prevent sending)
                toast.error('Profanity detected. Message not sent.');
            } else {
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
        }
    };


    // const identifyMisspelledWords = (text) => {
    //     // Check if the dictionary is loaded
    //     if (!dictionary) {
    //         // You can handle the case where the dictionary is not yet loaded
    //         console.error('Dictionary not loaded');
    //         return text;
    //     }
    //
    //     const words = text.split(/\s+/);
    //     const correctedText = words.map((word) => {
    //         const isMisspelled = !dictionary.check(word);
    //         return isMisspelled ? `<u>${word}</u>` : word;
    //     });
    //     return correctedText.join(' ');
    // };







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
                        <p>Private</p>
                        <p>Events</p>
                        <p>Yo</p>
                        <p>Yo</p>
                        <p>Yo</p>
                        <p>Yo</p>
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
                                                    width: '63.25px',
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
