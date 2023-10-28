import { Suspense } from 'react';
import { Loading } from './components';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import './index.css';
import './components/Loading/Loading.css';
import './components/Navbar/Navbar.css';
import './components/Footer/Footer.css';
import './components/ContextMenu/ContextMenu.css';
import './components/Layout/Layout.css'
import './components/GameHeader/GameHeader.css';
import './components/LeftSidebar/LeftSidebar.css';
import './components/RightSidebar/RightSidebar.css';
import './pages/Landing/Landing.css';
import './pages/NotFound/NotFound.css';
import './pages/Login/LoginForm.css';
import './pages/SignUp/SignUpForm.css';

function App() {
    return (
        <>
            <Suspense fallback={<Loading />}>
                <ToastContainer
                    position="top-center"
                    autoClose={2500}
                    limit={5}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
                <Outlet />
            </Suspense>
        </>
    );
}

export default App;
