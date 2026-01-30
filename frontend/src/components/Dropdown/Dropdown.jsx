import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

const Dropdown = ({ placeholder, role, onAction, options }) => {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const triggerRef = useRef(null);
	const menuRef = useRef(null);
	const itemRefs = useRef([]);

	// Close on click outside
	useEffect(() => {
		if (!open) return;
		const onDocClick = (e) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target) &&
				triggerRef.current &&
				!triggerRef.current.contains(e.target)
			) {
				setOpen(false);
			}
		};
		const onEscape = (e) => {
			if (e.key === "Escape") {
				setOpen(false);
				triggerRef.current?.focus();
			}
		};
		document.addEventListener("mousedown", onDocClick);
		document.addEventListener("keydown", onEscape);
		return () => {
			document.removeEventListener("mousedown", onDocClick);
			document.removeEventListener("keydown", onEscape);
		};
	}, [open]);

	// Focus the active item when menu opens or activeIndex changes
	useEffect(() => {
		if (!open) return;
		itemRefs.current[activeIndex]?.focus();
	}, [open, activeIndex]);

	const openMenu = (focusFirst = true) => {
		setOpen(true);
		if (focusFirst) setActiveIndex(0);
	};

	const closeMenu = () => {
		setOpen(false);
	};

	const onTriggerKeyDown = (e) => {
		// Open with ArrowDown focuses first; ArrowUp focuses last
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex(0);
			openMenu(true);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex(options.length - 1);
			openMenu(false);
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			openMenu(true);
		}
	};

	const onMenuKeyDown = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => (i + 1) % options.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => (i - 1 + options.length) % options.length);
		} else if (e.key === "Home") {
			e.preventDefault();
			setActiveIndex(0);
		} else if (e.key === "End") {
			e.preventDefault();
			setActiveIndex(options.length - 1);
		} else if (e.key === "Tab") {
			// close but let browser handle focus order
			setOpen(false);
		}
	};

	const handleSelect = (opt) => {
		onAction(opt);
		closeMenu();
		triggerRef.current?.focus();
	};

	return (
		<div className="user-dropdown">
			<p
				ref={triggerRef}
				type="button"
				className="user-dropdown-trigger"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls="user-menu"
				onClick={() => setOpen((o) => !o)}
				onKeyDown={onTriggerKeyDown}
			>
				{placeholder ? placeholder : "Welcome"}
				{open ? (
					<ChevronUpIcon style={{ width: "12px" }} />
				) : (
					<ChevronDownIcon style={{ width: "12px" }} />
				)}
			</p>

			{open && (
				<div
					ref={menuRef}
					id="user-menu"
					role="menu"
					aria-labelledby="user-menu-label"
					className="user-dropdown-menu"
					onKeyDown={onMenuKeyDown}
				>
					{options.map((opt, idx) => {
						// gate admin
						if (
							opt.value === "admin" &&
							!(role === "admin" || role === "superAdmin")
						) {
							return null;
						}

						return (
							<button
								key={opt.value}
								role="menuitem"
								className={`user-dropdown-item ${
									idx === activeIndex ? "is-active" : ""
								}`}
								ref={(el) => (itemRefs.current[idx] = el)}
								tabIndex={-1}
								onClick={() => handleSelect(opt)}
								onMouseEnter={() => setActiveIndex(idx)}
							>
								{opt.icon} {opt.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default Dropdown;
