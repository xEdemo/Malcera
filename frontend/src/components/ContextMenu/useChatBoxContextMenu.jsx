import { useEffect, useState } from 'react';

const useChatBoxContextMenu = () => {
    const isLeftSidebarOpenString = localStorage.getItem(
        'IS_LEFT_SIDEBAR_OPEN'
    );

    const isLeftSidebarOpen = isLeftSidebarOpenString
        ? JSON.parse(isLeftSidebarOpenString)
        : false;

    const initialContextMenu = {
        show: false,
        x: 0,
        y: 0,
        index: null,
    };

    const [contextMenu, setContextMenu] = useState(initialContextMenu);

    const showContextMenu = (index, e) => {
        e.preventDefault();
        const { scrollX, scrollY } = window;

        // Calculate the position of the username element
        const usernameRect = e.target.getBoundingClientRect();
        const usernameX = usernameRect.right + scrollX;
        const usernameY = usernameRect.top + scrollY + usernameRect.height / 2; // Middle of the username

        // Calculate the adjusted X position based on the sidebar status
        const adjustedX = isLeftSidebarOpen ? usernameX - 350 : usernameX;

        setContextMenu({
            show: true,
            x: adjustedX,
            y: usernameY, // Adjusted y-value to align username with last element
            index,
        });
    };

    const hideContextMenu = () => setContextMenu(initialContextMenu);

    useEffect(() => {
        const handleGlobalClick = () => {
            hideContextMenu();
        };

        // Add the event listener when the context menu is shown
        if (contextMenu.show) {
            document.addEventListener('click', handleGlobalClick);
        }

        // Remove the event listener when the component unmounts or the context menu is closed
        return () => {
            document.removeEventListener('click', handleGlobalClick);
        };
    }, [contextMenu.show]);

    return { contextMenu, showContextMenu };
};
export default useChatBoxContextMenu;
