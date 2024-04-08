import { memo, useMemo } from "react";
import { toast } from "react-toastify";

const ChatBoxContextMenu = ({ contextMenu, contextUsername }) => {
	const { x, y } = contextMenu;

	const elements = [
		{ content: "Hi", onClick: () => toast.success("Hi!") },
		{ content: "roon", style: { color: "gold" } },
		{
			content: "Bye",
			style: { color: "red" },
			onClick: () => toast.warning("Bye"),
		},
	];

	const yOffset = useMemo(() => {
		const elementHeight = 28;
		let totalHeight = elementHeight / 2; // 14 pixels to center in on the last element

        // Example of how to adjust the height based on which elements get rendered (make sure to adjust parameters in useMemo)
		const filteredElements = elements.filter((element) => {
			if (contextUsername && element.content === "Hi") {
				return false;
			}
			if (!contextMenu && element.content === "Bye") {
				return false;
			}
			return true;
		});

		totalHeight += elementHeight * filteredElements.length;

		return totalHeight;
	}, [contextMenu, contextUsername, elements]);

    // Example of how to conditionally render elements
	const filteredElements = useMemo(() => {
		return elements.filter((element) => {
			if (contextUsername && element.content === "Hi") {
				return false;
			}
			if (!contextMenu && element.content === "Bye") {
				return false;
			}
			return true;
		});
	}, [contextMenu, contextUsername, elements]);

	return (
		<>
			{contextMenu.show && contextUsername && (
				<div
					className="context-menu-chat-box-main"
					style={{
						top: `${y - yOffset}px`,
						left: `${x}px`, // Ensures the menu always appears to the right of the username
					}}
				>
					{filteredElements.map((element, index) => (
						<p
							key={index}
							onClick={element.onClick}
							style={element.style}
						>
							{element.content}
						</p>
					))}
					<p className="user-context-menu-username">
						&#8249; {contextUsername}
					</p>
				</div>
			)}
		</>
	);
};

export default memo(ChatBoxContextMenu);
