import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../../slices/auth/userApiSlice.js';
import { clearCredentials } from '../../slices/auth/authSlice.js';
import { memo, useState } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';

import logo from '../../images/malcera-temp-logo.png';
import leaderboardsIcon from '../../images/leaderboards.png';
import forumIcon from '../../images/forum.png';
import manualIcon from '../../images/manual-book.png';
import editIcon from '../../images/edit.png';
import loginIcon from '../../images/login.png';

const Navbar = () => {
    const [isMenuClicked, setIsMenuClicked] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const { userInfo } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logout] = useLogoutMutation();

    const options = [
        { value: 'settings', label: 'Profile' },
        { value: 'logout', label: 'Logout' },
    ];

    const logoutHandler = async () => {
        try {
            await logout().unwrap();
            dispatch(clearCredentials());
            navigate('/');
            toast.success('You have successfully logged out.');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    const updateMenu = () => {
        setIsMenuClicked((prevValue) => !prevValue);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
        const value = option ? option.value : null;
        if (value === 'logout') {
            logoutHandler();
        } else if (value === 'settings') {
            navigate('/profile');
        }
    };

    const customStyles = {
        control: (provided, { isDisabled, isFocused, isSelected }) => ({
            ...provided,
            backgroundColor: isDisabled
                ? '#ccc'
                : isFocused
                ? '#3c4dc2'
                : '#0b21b3',
            border: isFocused ? '1px solid #c2c2c2' : '1px solid transparent',
            boxShadow: isFocused ? '0 0 0 1px grey' : 'none',
        }),
        option: (provided, { isSelected, isFocused }) => ({
            ...provided,
            backgroundColor: isSelected
                ? '#141414'
                : isFocused
                ? '#3d3d3df2'
                : '#141414',
            color: isSelected ? 'black' : '#e0e0e0f2',
            cursor: 'pointer',
            ':active': {
                backgroundColor: '#666666f2', // Color when option is clicked
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#141414',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#a3a3a3f2', // Change the color of the placeholder text
        }),
        input: (provided) => ({
            ...provided,
            color: '#e0e0e0f2', // Change the color of the typed text
        }),
    };

    return (
        <header>
            <nav className="nav-header">
                <ul className="left-nav-container">
                    <li>
                        <Link to="/">
                            <img
                                src={logo}
                                alt="Malcera"
                                loading="lazy"
                                style={{ marginTop: '0.8rem' }}
                            />
                        </Link>
                    </li>
                    <li>
                        <Link className="box-nav-button" to="/leaderboards">
                            <img
                                src={leaderboardsIcon}
                                alt="Leaderboards Icon"
                                loading="lazy"
                            />
                            Leaderboards
                        </Link>
                    </li>
                    <li>
                        <Link className="box-nav-button" to="/forum">
                            <img
                                src={forumIcon}
                                alt="Forum Icon"
                                loading="lazy"
                            />
                            Forum
                        </Link>
                    </li>
                    <li>
                        <Link className="box-nav-button" to="/manual">
                            <img
                                src={manualIcon}
                                alt="Manual Icon"
                                loading="lazy"
                            />
                            Manual
                        </Link>
                    </li>
                </ul>
                {userInfo ? (
                    <ul className="right-nav-container">
                        <li>
                            <Link className="box-nav-play-button" to="/game">
                                <img
                                    src={editIcon}
                                    alt="Edit logo"
                                    loading="lazy"
                                />
                                Play
                            </Link>
                        </li>
                        <li className="user-nav-dropdown" role="navigation">
                            <Select
                                value={selectedOption}
                                options={options}
                                onChange={handleOptionChange}
                                styles={customStyles}
                                placeholder={`Hello ${userInfo.username}`}
                                aria-label="Account Options"
                            />
                        </li>
                        <div
                            className={`burger-menu ${
                                isMenuClicked ? 'clicked' : 'b2default'
                            }`}
                            onClick={updateMenu}
                        >
                            <div className="burger-bar"></div>
                            <div className="burger-bar"></div>
                            <div className="burger-bar"></div>
                        </div>
                    </ul>
                ) : (
                    <ul className="right-nav-container">
                        <li>
                            <Link className="box-nav-button" to="/signup">
                                <img
                                    src={editIcon}
                                    alt="Edit logo"
                                    loading="lazy"
                                />
                                Sign Up
                            </Link>
                        </li>
                        <li>
                            <Link className="box-nav-button" to="/login">
                                <img
                                    src={loginIcon}
                                    alt="Login logo"
                                    loading="lazy"
                                />
                                Login
                            </Link>
                        </li>
                        <div
                            className={`burger-menu ${
                                isMenuClicked ? 'clicked' : 'b2default'
                            }`}
                            onClick={updateMenu}
                        >
                            <div className="burger-bar"></div>
                            <div className="burger-bar"></div>
                            <div className="burger-bar"></div>
                        </div>
                    </ul>
                )}
            </nav>
            <div className={`menu ${isMenuClicked ? 'visible' : ''}`}>
                <ul className="burger-menu-options">
                    <li>
                        <Link to="/">
                            <h2>Home</h2>
                        </Link>
                    </li>
                    <li>
                        <Link to="/leaderboards">
                            <h2>Leaderboards</h2>
                        </Link>
                    </li>
                    <li>
                        <Link to="/forum">
                            <h2>Forum</h2>
                        </Link>
                    </li>
                    <li>
                        <Link to="/manual">
                            <h2>Manual</h2>
                        </Link>
                    </li>
                    {userInfo ? (
                        <>
                            <li>
                                <Link to="/profile">
                                    <h2>Profile</h2>
                                </Link>
                            </li>
                            <li>
                                <Link onClick={logoutHandler}>
                                    <h2>Logout</h2>
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/signup">
                                    <h2>Sign Up</h2>
                                </Link>
                            </li>
                            <li>
                                <Link to="/login">
                                    <h2>Login</h2>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </header>
    );
};
export default memo(Navbar);
