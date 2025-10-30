import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../slices/auth/userApiSlice.js";
import { clearCredentials } from "../../slices/auth/authSlice.js";
import { memo, useState, useEffect } from "react";
import { getUserInfo } from "../../slices/auth/authSlice.js";
import { Loading } from "../";
import { toast } from "react-toastify";
import { Dropdown, LeaderboardsMegaMenu } from "../";

import logo from "../../images/malcera-temp-logo.png";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { ImPlay3 } from "react-icons/im";
import { ImProfile } from "react-icons/im";
import { FiLogOut } from "react-icons/fi";

const Navbar = () => {
	const [isMenuClicked, setIsMenuClicked] = useState(false);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [userData, setUserData] = useState();
	const [isLoading, setIsLoading] = useState(true);

	const fetchUserData = async () => {
		try {
			const res = await dispatch(getUserInfo());
			if (res.payload && res.payload.user) {
				setUserData(res.payload.user);
			}
		} catch (error) {
			console.error("Error fetching user data", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	const [logout] = useLogoutMutation();

	const options = [
		{ value: "play", label: "Play", icon: <ImPlay3 /> },
		{ value: "settings", label: "Profile", icon: <ImProfile /> },
		{ value: "logout", label: "Logout", icon: <FiLogOut /> },
	];

	const logoutHandler = async () => {
		try {
			await logout().unwrap();
			dispatch(clearCredentials());
			navigate("/");
			window.location.reload();
		} catch (err) {
			toast.error(err?.data?.message || err.error);
		}
	};

	const updateMenu = () => {
		setIsMenuClicked((prevValue) => !prevValue);
	};

	const handleOptionChange = (option) => {
		const value = option ? option.value : null;
		if (value === "play") {
			navigate("/game");
		} else if (value === "settings") {
			navigate("/profile");
		} else if (value === "logout") {
			logoutHandler();
		}
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<header>
			<nav className="nav-header">
				<ul>
					<li>
						<Link to="/">
							<img src={logo} alt="Malcera" loading="lazy" />
						</Link>
					</li>
				</ul>
				<ul className="middle-nav-container">
					<li>
						<LeaderboardsMegaMenu />
					</li>
					<li>
						<Link className="box-nav-button" to="/forum">
							Forum
						</Link>
					</li>
					<li>
						<Link className="box-nav-button" to="/manual">
							Manual
						</Link>
					</li>
				</ul>
				{userData ? (
					<ul className="right-nav-container">
						<li className="user-nav-dropdown" role="navigation">
							<div>
								<Dropdown
									placeholder={userData.account.username}
									options={options}
									onAction={handleOptionChange}
								/>
							</div>
						</li>
						<div
							className={`burger-menu ${
								isMenuClicked ? "clicked" : "b2default"
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
								Sign Up
							</Link>
						</li>
						<li>
							<Link className="box-nav-button" to="/login">
								Login
							</Link>
						</li>
						<div
							className={`burger-menu ${
								isMenuClicked ? "clicked" : "b2default"
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
			<div className={`menu ${isMenuClicked ? "visible" : ""}`}>
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
					{userData ? (
						<>
							<li>
								<Link to="/game">
									<h2>Play</h2>
								</Link>
							</li>
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
