import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import logo from "../../../assets/landing/malcera-temp-logo.png";

const AdminSidebar = ({ isSidebarOpen }) => {
	const [isApiOpen, setIsApiOpen] = useState(true);
	const [isDataOpen, setIsDataOpen] = useState(true);

	const location = useLocation();
	const navigate = useNavigate();

	const apiCall = [
		{
			label: "Items",
			onClick: () => {
				navigate("/admin/item");
			},
			isSelected: location.pathname.includes("/admin/item")
				? true
				: false,
		},
		{
			label: "Maps",
			onClick: () => {
				navigate("/admin/map");
			},
			isSelected: location.pathname.includes("/admin/map")
				? true
				: false,
		},
		{
			label: "Mobs",
			onClick: () => {
				navigate("/admin/mob");
			},
			isSelected: location.pathname.includes("/admin/mob")
				? true
				: false,
		},
		{
			label: "Users",
			onClick: () => {
				navigate("/admin/user");
			},
			isSelected: location.pathname.includes("/admin/user")
				? true
				: false,
		},
	];

	return (
		<div
			className={`admin-sidebar-container ${
				isSidebarOpen ? "open" : "closed"
			}`}
		>
			<div className="admin-sidebar-content">
				<Link to={"/admin"}>
					<img src={logo} alt="Malcera" loading="lazy" />
				</Link>

				<div className="admin-sidebar-section">
					<button
						type="button"
						className="admin-sidebar-section-header"
						onClick={() => setIsApiOpen((v) => !v)}
						aria-expanded={isApiOpen}
					>
						<h3>API Calls</h3>
						<FiChevronDown
							className={`chev ${isApiOpen ? "open" : ""}`}
							size={18}
						/>
					</button>
					<div
						className={`admin-sidebar-section-body ${
							isApiOpen ? "open" : "closed"
						}`}
					>
						{apiCall.map((api, i) => (
							<React.Fragment key={i}>
								<p
									className={`admin-sidebar-api-links ${
										api.isSelected ? "active" : ""
									}`}
									onClick={api.onClick}
								>
									{api.label}
								</p>
							</React.Fragment>
						))}
					</div>
				</div>

				<div className="admin-sidebar-section">
					<button
						type="button"
						className="admin-sidebar-section-header"
						onClick={() => setIsDataOpen((v) => !v)}
						aria-expanded={isDataOpen}
					>
						<h3>Data</h3>
						<FiChevronDown
							className={`chev ${isDataOpen ? "open" : ""}`}
							size={18}
						/>
					</button>
					<div
						className={`admin-sidebar-section-body ${
							isDataOpen ? "open" : "closed"
						}`}
					>
						<p className="admin-sidebar-api-links">placeholder</p>
						<p className="admin-sidebar-api-links">placeholder</p>
						<p className="admin-sidebar-api-links">placeholder</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminSidebar;
