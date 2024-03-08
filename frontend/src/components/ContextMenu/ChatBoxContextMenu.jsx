import { memo, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ChatBoxContextMenu = ({ contextMenu }) => {
    return (
        <>
            {contextMenu.show && (
                <div
                    className="context-menu-chat-box-main"
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`, // Ensure the menu always appears to the right of the username
                    }}
                >
                    <p>Context Menu</p>
                    <p>Hi</p>
                    <p>Bye &#8250;</p>
                    <p>ron</p>
                    <p>roo</p>
                    <p>ron</p>
                    <p>roo</p>
                </div>
            )}
        </>
    );
};

export default memo(ChatBoxContextMenu);
