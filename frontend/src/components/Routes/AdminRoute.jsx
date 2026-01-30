import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUserInfo } from "../../slices/auth/authSlice.js";
import { Loading } from "../index.jsx";
import { toast } from "react-toastify";

const AdminRoute = () => {
	const [userData, setUserData] = useState();
	const [isLoading, setIsLoading] = useState(true);

	const dispatch = useDispatch();

	const fetchUserData = async () => {
		try {
			const res = await dispatch(getUserInfo()).unwrap();
			//console.log(res);
			if (res && res.user) {
				//console.log(res.user);
				setUserData(res.user);
			}
		} catch (err) {
			toast.error("Error fetching user data", err);
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

	return userData.account.role === "superAdmin" || userData.account.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
