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
        setIsLeftSidebarOpen(!isLeftSidebarOpen);
    };

    const toggleRightSidebar = () => {
        setIsRightSidebarOpen(!isRightSidebarOpen);
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
