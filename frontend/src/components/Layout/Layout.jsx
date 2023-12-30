import { useState, useEffect, memo } from 'react';
import { Outlet } from 'react-router-dom';
import { ChatBox, GameHeader, LeftSidebar, RightSidebar } from '../index.jsx';

const Layout = () => {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(
        JSON.parse(localStorage.getItem('IS_LEFT_SIDEBAR_OPEN')) || false
    );
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(
        JSON.parse(localStorage.getItem('IS_RIGHT_SIDEBAR_OPEN')) || false
    );

    return (
        <div
            style={{
                maxWidth: '100vw',
                overflowX: 'hidden',
            }}
        >
            <GameHeader
                isLeftSidebarOpen={isLeftSidebarOpen}
                setIsLeftSidebarOpen={setIsLeftSidebarOpen}
                isRightSidebarOpen={isRightSidebarOpen}
                setIsRightSidebarOpen={setIsRightSidebarOpen}
            />
            <div style={{ display: 'flex' }}>
                <div
                    className={
                        isLeftSidebarOpen ? 'left-sidebar' : 'left-sidebar-open'
                    }
                >
                    <LeftSidebar />
                </div>
                <div
                    className={`main-content-space ${
                        isLeftSidebarOpen ? '' : 'main-content-space-push-right'
                    }`}
                >
                    <Outlet />
                    <ChatBox />
                </div>
                <div
                    className={
                        isRightSidebarOpen
                            ? 'right-sidebar'
                            : 'right-sidebar-open'
                    }
                >
                    <RightSidebar />
                </div>
            </div>
        </div>
    );
};
export default memo(Layout);
