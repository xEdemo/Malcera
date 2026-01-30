import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminHeader, AdminSidebar } from "../..";

const AdminLayout = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		() => JSON.parse(localStorage.getItem("IS_ADMIN_SIDEBAR_OPEN")) ?? true
	);

	const toggleSidebar = () => {
		const newState = !isSidebarOpen;
		setIsSidebarOpen(newState);
		localStorage.setItem("IS_ADMIN_SIDEBAR_OPEN", JSON.stringify(newState));
	};

	return (
		<div
			className={`admin-layout-container ${
				isSidebarOpen ? "sidebar-open" : "sidebar-closed"
			}`}
		>
			{/* Left: sidebar */}
			<AdminSidebar isSidebarOpen={isSidebarOpen} />

			{/* Right: header + content */}
			<div className="admin-main">
				<AdminHeader
					toggleSidebar={toggleSidebar}
					isSidebarOpen={isSidebarOpen}
				/>

				<div className="admin-layout-content">
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default AdminLayout;
