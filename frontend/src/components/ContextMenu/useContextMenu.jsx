import { useEffect, useState } from "react";

const useContextMenu = () => {

    const initialContextMenu = {
        show: false,
        x: 0,
        y: 0,
    };

    const [contextMenu, setContextMenu] = useState(initialContextMenu);

    const showContextMenu = (e) => {
        e.preventDefault();
        const { pageX, pageY } = e;
        setContextMenu({ show: true, x: pageX, y: pageY });
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
