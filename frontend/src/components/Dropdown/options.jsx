import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";
import { clearCredentials } from "../../slices/auth/authSlice";
import { useLogoutMutation } from "../../slices/auth/userApiSlice";
import { ImPlay3 } from "react-icons/im";
import { ImProfile } from "react-icons/im";
import { FiLogOut } from "react-icons/fi";
import { toast } from "react-toastify";

export const options = [
	{ value: "play", label: "Play", icon: <ImPlay3 /> },
	{
		value: "admin",
		label: "Admin Dashboard",
		icon: <MdAdminPanelSettings />,
	},
	{ value: "settings", label: "Profile", icon: <ImProfile /> },
	{ value: "logout", label: "Logout", icon: <FiLogOut /> },
];

export function useHeaderOptions() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [logout] = useLogoutMutation();

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

	const handleOptionChange = (option) => {
		const value = option ? option.value : null;

		if (value === "play") {
			navigate("/game");
		} else if (value === "admin") {
			navigate("/admin");
		} else if (value === "settings") {
			navigate("/profile");
		} else if (value === "logout") {
			logoutHandler();
		}
	};

	return { options, handleOptionChange };
}
