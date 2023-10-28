import { useState } from 'react';
import GameHeader from '../GameHeader/GameHeader.jsx';
import LeftSidebar from '../LeftSidebar/LeftSidebar.jsx';
import RightSidebar from '../RightSidebar/RightSidebar.jsx';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
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
            <div style={{ display: 'flex', gap: '1rem' }}>
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
export default Layout;
