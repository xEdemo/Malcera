import { useState, useEffect } from "react";
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { getUserInfo } from '../slices/auth/authSlice.js';
import { Loading } from "./";

const PrivateRoute = () => {
    const [userData, setUserData] = useState();
	const [isLoading, setIsLoading] = useState(true);

	const dispatch = useDispatch();

    const fetchUserData = async () => {
		try {
			const res = await dispatch(getUserInfo());
			if (res.payload && res.payload.user) {
				console.log(res.payload.user);
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
		return <Loading />
	}

    return userData ? <Outlet /> : <Navigate to="/login" replace />;
};
export default PrivateRoute;
