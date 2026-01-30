import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
	TbLayoutSidebarLeftCollapse,
	TbLayoutSidebarLeftExpand,
} from "react-icons/tb";
import { getUserInfo } from "../../../slices/auth/authSlice";
import { Dropdown, Loading } from "../../";
import { useHeaderOptions } from "../../Dropdown/options";

const AdminHeader = ({ toggleSidebar, isSidebarOpen }) => {
	const [userData, setUserData] = useState();
	const [isLoading, setIsLoading] = useState(true);

	const { options, handleOptionChange } = useHeaderOptions();
	const dispatch = useDispatch();

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

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="admin-header-container">
			<div> 
				<div className="admin-sidebar-toggle" onClick={toggleSidebar}>
					{isSidebarOpen ? (
						<TbLayoutSidebarLeftCollapse size={32} />
					) : (
						<TbLayoutSidebarLeftExpand size={32} />
					)}
				</div>
			</div>
			{/* search function for any unique id (centered) */}
			<div>
				<p>search</p>
			</div>
			<div>
				<Dropdown
					placeholder={userData.account.username}
					role={userData.account.role}
					options={options}
					onAction={handleOptionChange}
				/>
			</div>
		</div>
	);
};

export default AdminHeader;
