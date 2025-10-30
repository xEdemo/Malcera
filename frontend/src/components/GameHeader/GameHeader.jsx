import { RectangleStackIcon as SolidRectangleStackIcon } from "@heroicons/react/24/solid";
import { RectangleStackIcon as OutlineRectangleStackIcon } from "@heroicons/react/24/outline";
import { GlobeAltIcon as SolidGlobeAltIcon } from "@heroicons/react/24/solid";
import { GlobeAltIcon as OutlineGlobeAltIcon } from "@heroicons/react/24/outline";

const GameHeader = ({
	isLeftSidebarOpen,
	setIsLeftSidebarOpen,
	isRightSidebarOpen,
	setIsRightSidebarOpen,
	isDev,
	setIsDev,
	userData,
}) => {
	const toggleLeftSidebar = () => {
		const newValue = !isLeftSidebarOpen;
		setIsLeftSidebarOpen(newValue);
		localStorage.setItem("IS_LEFT_SIDEBAR_OPEN", JSON.stringify(newValue));
	};

	const toggleRightSidebar = () => {
		const newValue = !isRightSidebarOpen;
		setIsRightSidebarOpen(newValue);
		localStorage.setItem("IS_RIGHT_SIDEBAR_OPEN", JSON.stringify(newValue));
	};

	const calculateMainContentWidth = () => {
		let width = "100vw";
		if (isLeftSidebarOpen && !isRightSidebarOpen)
			width = "calc(100vw - 35rem)";
		if (!isLeftSidebarOpen && isRightSidebarOpen)
			width = "calc(100vw - 35rem)";
		if (isLeftSidebarOpen && isRightSidebarOpen)
			width = "calc(100vw - 70rem)";
		return width;
	};

	return (
		<>
			<div
				className="game-main-header"
				style={{ width: calculateMainContentWidth() }}
			>
				<div className="left-game-header-container">
					{isLeftSidebarOpen ? (
						<SolidRectangleStackIcon
							onClick={toggleLeftSidebar}
							className="icon-access-left-sidebar"
						/>
					) : (
						<OutlineRectangleStackIcon
							onClick={toggleLeftSidebar}
							className="icon-access-left-sidebar"
						/>
					)}
				</div>
				{userData.account.role === "superAdmin" && (
					<div
						style={{
							marginTop: "1rem",
							marginBottom: "1rem",
							height: "40px",
							width: "100px",
							border: "1px solid whitesmoke",
							cursor: "pointer",
						}}
					>
						{isDev ? (
							<p
								style={{
									textAlign: "center",
									marginTop: "4.5px",
								}}
                                onClick={(e) => {
                                    setIsDev(false)
                                }}
							>
								Prod Mode
							</p>
						) : (
							<p
								style={{
									textAlign: "center",
									marginTop: "4.5px",
								}}
                                onClick={(e) => {
                                    setIsDev(true)
                                }}
							>
								Dev Mode
							</p>
						)}
					</div>
				)}
				<div className="right-game-header-container">
					{isRightSidebarOpen ? (
						<SolidGlobeAltIcon
							onClick={toggleRightSidebar}
							className="icon-access-right-sidebar"
						/>
					) : (
						<OutlineGlobeAltIcon
							onClick={toggleRightSidebar}
							className="icon-access-right-sidebar"
						/>
					)}
				</div>
			</div>
		</>
	);
};
export default GameHeader;
