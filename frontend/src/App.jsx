import { Suspense } from "react";
import { Loading } from "./components";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";

import "./components/Loading/Loading.css";
import "./components/Navbar/Navbar.css";
import "./components/Footer/Footer.css";
import "./components/ContextMenu/InventoryContextMenu.css";
import "./components/ContextMenu/ChatBoxContextMenu.css";
import "./components/GameHeader/GameHeader.css";
import "./components/Inventory/Inventory.css";
import "./components/Character/Character.css";
import "./components/LeftSidebar/LeftSidebar.css";
import "./components/RightSidebar/RightSidebar.css";
import "./components/ChatBox/ChatBox.css";
import "./components/Dropdown/Dropdown.css";
import "./components/Navbar/LeaderboardsMegaMenu.css";
import "./components/Admin/Layout/AdminLayout.css";
import "./components/Admin/Header/AdminHeader.css";
import "./components/Admin/Sidebar/AdminSidebar.css";
import "./components/Admin/DynamicTable/AdminDynamicTable.css";
import "./components/Admin/DeleteModal/AdminDeleteModal.css";
import "./components/Admin/FormFields/AdminFormFields.css";

import "./pages/Landing/Landing.css";
import "./pages/NotFound/NotFound.css";
import "./pages/Login/LoginForm.css";
import "./pages/SignUp/SignUpForm.css";
import "./pages/Game/Game.css";

function App() {
	return (
		<>
			<Suspense fallback={<Loading />}>
				<ToastContainer
					position="bottom-left"
					autoClose={2500}
					limit={5}
					hideProgressBar
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="colored"
				/>
				<Outlet />
			</Suspense>
		</>
	);
}

export default App;
