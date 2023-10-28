import TabContent from "./TabContent";
import { memo } from 'react';

const TabContainer = ({ selectedTab, onTabClick }) => {
    return (
        <>
            <div className="homepage-tab-container">
                <h5
                    className={
                        selectedTab === 'aboutMalcera' ? 'active-tab' : ''
                    }
                    onClick={() => onTabClick('aboutMalcera')}
                >
                    About Malcera
                </h5>
                <h5
                    className={
                        selectedTab === 'aboutTheDev' ? 'active-tab' : ''
                    }
                    onClick={() => onTabClick('aboutTheDev')}
                >
                    About the Dev
                </h5>
                <h5
                    className={selectedTab === 'upcoming' ? 'active-tab' : ''}
                    onClick={() => onTabClick('upcoming')}
                >
                    Upcoming
                </h5>
            </div>
            <TabContent selectedTab={selectedTab} />
        </>
    );
};
export default memo(TabContainer);
