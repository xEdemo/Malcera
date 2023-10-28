import { memo } from 'react';

const TabContent = ({ selectedTab }) => {
    return (
        <div className="homepage-content-container">
            {selectedTab === 'aboutMalcera' && (
                <div className="homepage-content-box">
                    <p>About Malcera tab is selected</p>
                </div>
            )}
            {selectedTab === 'aboutTheDev' && (
                <div className="homepage-content-box">
                    <p>About the Dev tab is selected</p>
                </div>
            )}
            {selectedTab === 'upcoming' && (
                <div className="homepage-content-box">
                    <p>Upcoming tab is selected</p>
                </div>
            )}
        </div>
    );
};
export default memo(TabContent);
