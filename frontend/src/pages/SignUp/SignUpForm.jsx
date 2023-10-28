import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Footer } from '../../components';
import { useRegisterMutation } from '../../slices/auth/userApiSlice.js';
import { toast } from 'react-toastify';

const SignUpForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [register, { isLoading }] = useRegisterMutation();

    // Grabs user information
    const { userInfo } = useSelector((state) => state.auth);

    // Navigates to homepage if already logged in
    useEffect(() => {
        if (userInfo) {
            navigate('/');
        }
    }, [navigate, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error(`Passwords do not match`);
        } else {
            try {
                // was const res = await register({
                await register({
                    username,
                    email,
                    password,
                }).unwrap();
                // dispatch(setCredentials({ ...res })); Uncomment to create local storage on account creation
                // Navigates user to login on register success
                navigate('/login');
                toast.success(
                    `Welcome ${username}. Your account has been made. Please Login.`
                );
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="homepage-main-container signup-main-container">
                <div className="form-flow-flex">
                    <h2>Sign Up</h2>
                    <form onSubmit={submitHandler}>
                        <label htmlFor="signup-username">Username: </label>
                        <input
                            type="text"
                            name="username"
                            id="signup-username"
                            placeholder="Enter Username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            minLength={3}
                            maxLength={16}
                        />
                        <label htmlFor="signup-email">Email: </label>
                        <input
                            type="email"
                            name="email"
                            id="signup-email"
                            placeholder="Enter Email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="signup-password">Password: </label>
                        <input
                            type="password"
                            name="password"
                            id="signup-password"
                            placeholder="Enter Password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            maxLength={60}
                        />
                        <label htmlFor="signup-confirm-password">
                            Confirm Password:
                        </label>
                        <input
                            type="password"
                            name="confirm-password"
                            id="signup-confirm-password"
                            placeholder="Confirm Password..."
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {isLoading ? (
                            <button type="button" className="button-loading">
                                <span className="button-text-hidden">
                                    Sign Up
                                </span>
                            </button>
                        ) : (
                            <button type="submit">Sign Up</button>
                        )}
                    </form>
                    <p>
                        Already have an account?
                        <Link to="/login">Login here</Link>.
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
};
export default SignUpForm;
