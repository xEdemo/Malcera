import { memo, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

const ChatBoxContextMenu = ({ contextMenu, contextUsername }) => {
    const { x, y } = contextMenu;

    const yOffset = useMemo(() => {
        let totalHeight = 242.5;
        const elementHeight = 28;
        // Example of how to adjust The context menu if conditional rendering is needed
        //totalHeight += contextUsername ? elementHeight : 0;
        return totalHeight;
    }, [contextMenu]);

    return (
        <>
            {contextMenu.show && contextUsername && (
                <div
                    className="context-menu-chat-box-main"
                    style={{
                        top: `${y - yOffset}px`,
                        left: `${x}px`, // Ensure the menu always appears to the right of the username
                    }}
                >
                    <p>Context Menu</p>
                    <p>Hi</p>
                    <p>Bye &#8250;</p>
                    <p>ron</p>
                    <p>roo</p>
                    <p>ron</p>
                    <p className='user-context-menu-username'>&#8249; {contextUsername}</p>
                </div>
            )}
        </>
    );
};

export default memo(ChatBoxContextMenu);
