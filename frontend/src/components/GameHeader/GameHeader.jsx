import { RectangleStackIcon as SolidRectangleStackIcon } from '@heroicons/react/24/solid';
import { RectangleStackIcon as OutlineRectangleStackIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon as SolidGlobeAltIcon } from '@heroicons/react/24/solid';
import { GlobeAltIcon as OutlineGlobeAltIcon } from '@heroicons/react/24/outline';

const GameHeader = ({
    isLeftSidebarOpen,
    setIsLeftSidebarOpen,
    isRightSidebarOpen,
    setIsRightSidebarOpen,
}) => {
    const toggleLeftSidebar = () => {
        const newValue = !isLeftSidebarOpen;
        setIsLeftSidebarOpen(newValue);
        localStorage.setItem('IS_LEFT_SIDEBAR_OPEN', JSON.stringify(newValue));
    };

    const toggleRightSidebar = () => {
        const newValue = !isRightSidebarOpen;
        setIsRightSidebarOpen(newValue);
        localStorage.setItem('IS_RIGHT_SIDEBAR_OPEN', JSON.stringify(newValue));
    };
    return (
        <>
            <div className="game-main-header">
                <div className="left-game-header-container">
                    {isLeftSidebarOpen ? (
                        <SolidRectangleStackIcon
                            onClick={toggleLeftSidebar}
                            className="icon-access-left-sidebar"
                        />
                    ) : (
                        <OutlineRectangleStackIcon
                            onClick={toggleLeftSidebar}
                            className="icon-access-left-sidebar"
                        />
                    )}
                </div>
                <div className="right-game-header-container">
                    {isRightSidebarOpen ? (
                        <SolidGlobeAltIcon
                            onClick={toggleRightSidebar}
                            className="icon-access-right-sidebar"
                        />
                    ) : (
                        <OutlineGlobeAltIcon
                            onClick={toggleRightSidebar}
                            className="icon-access-right-sidebar"
                        />
                    )}
                </div>
            </div>
        </>
    );
};
export default GameHeader;
