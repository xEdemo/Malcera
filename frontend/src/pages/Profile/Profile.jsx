import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Footer } from '../../components';
import { setCredentials, clearCredentials } from '../../slices/auth/authSlice.js';
import { toast } from 'react-toastify';
import { useUpdateUserMutation, useLogoutMutation } from '../../slices/auth/userApiSlice.js';

const Profile = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [logout] = useLogoutMutation();

    // Grabs user information
    const { userInfo } = useSelector((state) => state.auth);

    const [updateProfile, { isLoading }] = useUpdateUserMutation();

    // Navigates to homepage if already logged in
    useEffect(() => {
        if (userInfo) {
            setUsername(userInfo.username);
            setEmail(userInfo.email);
        }
    }, [userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error(`Passwords do not match`);
        } else {
            try {
                const res = await updateProfile({
                    _id: userInfo._id,
                    username,
                    email,
                    password,
                }).unwrap();
                dispatch(setCredentials({ ...res }));
                await logout().unwrap();
                dispatch(clearCredentials());
                navigate('/login');
                toast.success('Profile updated. Please relogin.');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    // Have it so the user can see their stats and placing in the future
    return (
        <>
            <Navbar />
            <h2 style={{ margin: '10rem' }}>Update Profile</h2>
            <form onSubmit={submitHandler}>
                <label htmlFor="signup-username">Username: </label>
                <input
                    type="text"
                    name="username"
                    id="signup-username"
                    placeholder="Enter Username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                        <span className="button-text-hidden">Update</span>
                    </button>
                ) : (
                    <button type="submit">Update</button>
                )}
            </form>
            <Footer />
        </>
    );
};
export default Profile;
