import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

const ChatBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.user);

    // use useEffect for WebSockets here

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && inputValue.trim() !== '') {
            // Add the new message to the messages array
            // userInfo.username may need to get changed based on WebSocket data
            setMessages([...messages, `${userInfo.username}: ${inputValue}`]);

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
                            {message}
                        </p>
                    ))}
                </div>
                <div className="chat-box-input-region">
                    <b>{userInfo.username}:</b>
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
