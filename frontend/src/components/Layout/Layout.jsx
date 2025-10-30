import { useState, memo, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
	ChatBox,
	GameHeader,
	LeftSidebar,
	RightSidebar,
	Canvas,
	DevCanvas,
} from "../index.jsx";
import { getUserInfo } from "../../slices/auth/authSlice.js";
import { Loading } from '../'

const Layout = () => {
	const dispatch = useDispatch();

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

	const refetchUserData = () => {
		fetchUserData();
	};

	useEffect(() => {
		fetchUserData();
	}, []);

	const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(
		JSON.parse(localStorage.getItem("IS_LEFT_SIDEBAR_OPEN")) || false
	);
	const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(
		JSON.parse(localStorage.getItem("IS_RIGHT_SIDEBAR_OPEN")) || false
	);

	const [isDev, setIsDev] = useState(false);

	if (isLoading) {
		return <Loading />
	}

	return (
		<div
			style={{
				maxWidth: "100vw",
				maxHeight: "100vh",
				overflowX: "hidden",
				overflowY: "hidden",
			}}
		>
			<div style={{ display: "flex" }}>
				<div
					className={
						isLeftSidebarOpen ? "left-sidebar" : "left-sidebar-open"
					}
				>
					<LeftSidebar />
				</div>
				<div
					className={`main-content-space 
                    ${
						isLeftSidebarOpen ? "" : "main-content-space-push-right"
					}`}
				>
					<GameHeader
						isLeftSidebarOpen={isLeftSidebarOpen}
						setIsLeftSidebarOpen={setIsLeftSidebarOpen}
						isRightSidebarOpen={isRightSidebarOpen}
						setIsRightSidebarOpen={setIsRightSidebarOpen}
						isDev={isDev}
						setIsDev={setIsDev}
						userData={userData}
					/>
					{/* <Outlet /> */}
					{isDev && userData.account.role === "superAdmin" ? (
						<DevCanvas userData={userData} />
					) : (
						<Canvas
							isLeftSidebarOpen={isLeftSidebarOpen}
							isRightSidebarOpen={isRightSidebarOpen}
							userData={userData}
							refetchUserData={refetchUserData}
						/>
					)}
					<ChatBox userData={userData} />
				</div>
				<div
					className={
						isRightSidebarOpen
							? "right-sidebar"
							: "right-sidebar-open"
					}
				>
					<RightSidebar />
				</div>
			</div>
		</div>
	);
};
export default memo(Layout);
