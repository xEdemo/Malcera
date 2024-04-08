import { useEffect, useState } from 'react';

const useInventoryContextMenu = () => {

    const initialContextMenu = {
        show: false,
        x: 0,
        y: 0,
        index: null,
    };

    const [contextMenu, setContextMenu] = useState(initialContextMenu);

    const showContextMenu = (index, e) => {
        e.preventDefault();

        const itemRect = e.target.getBoundingClientRect();
        const itemX = (itemRect.right - (48 + 30)); // (second value) => width of cell + ((width of context menu (110) - width of cell) / 2) (this can be done dynamicly, but that is a lot of shit)
        const itemY = itemRect.bottom - scrollY;
    
        setContextMenu({
            show: true,
            x: itemX,
            y: itemY,
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
export default useInventoryContextMenu;
