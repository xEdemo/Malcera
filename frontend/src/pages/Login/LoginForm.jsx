import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Footer } from '../../components';
import { useLoginMutation } from '../../slices/auth/userApiSlice.js';
import { setCredentials } from '../../slices/auth/authSlice.js';
import { toast } from 'react-toastify';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            navigate('/');
        }
    }, [navigate, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ email, password }).unwrap();
            dispatch(setCredentials({ ...res }));
            navigate('/');
            window.location.reload();
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="homepage-main-container login-main-container">
                <div className="form-flow-flex">
                    <h2>Login</h2>
                    <form onSubmit={submitHandler}>
                        <label htmlFor="login-email">Email: </label>
                        <input
                            type="email"
                            name="email"
                            id="login-email"
                            placeholder="Enter Email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="login-password">Password: </label>
                        <input
                            type="password"
                            name="password"
                            id="login-password"
                            placeholder="Enter Password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {isLoading ? (
                            <button type="button" className="button-loading">
                                <span className="button-text-hidden">
                                    Login
                                </span>
                            </button>
                        ) : (
                            <button type="submit">Login</button>
                        )}
                    </form>
                    <p>
                        <Link to="/">Forgot Password</Link>?
                    </p>
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup">Sign up here</Link>.
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
};
export default LoginForm;
