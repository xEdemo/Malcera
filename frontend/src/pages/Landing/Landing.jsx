import { useReducer } from 'react';
import { Navbar } from '../../components';
import TabContainer from './TabContainer.jsx';
import { Footer } from '../../components';

const SELECTED_TAB = 'SELECTED_TAB';

const tabReducer = (state, action) => {
    switch (action.type) {
        case SELECTED_TAB:
            return action.payload.tab;
        default:
            throw new Error(`No matching ${action.type} - action type.`);
    }
};

const Landing = () => {
    const [selectedTab, dispatch] = useReducer(tabReducer, 'aboutMalcera');

    const handleTabClick = (tab) => {
        dispatch({ type: SELECTED_TAB, payload: { tab } });
    };

    return (
        <>
            <Navbar />
            <div className="homepage-main-container">
                <TabContainer
                    selectedTab={selectedTab}
                    onTabClick={handleTabClick}
                />
            </div>
            <Footer />
        </>
    );
};

export default Landing;
