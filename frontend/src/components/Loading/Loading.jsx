import { ClipLoader } from 'react-spinners';

const Loading = () => {
    return (
        <div className="loading-component-container">
            <div className="loading-component-box">
                <ClipLoader />
            </div>
        </div>
    );
};
export default Loading;
