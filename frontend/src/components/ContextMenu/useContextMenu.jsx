import { useEffect, useState } from 'react';

const useContextMenu = () => {
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
        const { clientX, clientY } = e;
        const { scrollX, scrollY } = window;

        console.log(isLeftSidebarOpen);

        if (isLeftSidebarOpen) {
            const sidebarWidth = 350;
            const adjustedX = clientX - sidebarWidth;
            setContextMenu({
                show: true,
                x: adjustedX + scrollX,
                y: clientY + scrollY,
                index,
            });
        } else {
            setContextMenu({
                show: true,
                x: clientX + scrollX,
                y: clientY + scrollY,
                index,
            });
        }
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
export default useContextMenu;
