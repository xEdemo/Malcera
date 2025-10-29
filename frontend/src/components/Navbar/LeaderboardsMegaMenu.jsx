import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

const sections = [
	{
		title: "PvE",
		items: [
			{
				label: "Boss Kills",
				to: "/leaderboards/boss-kills",
				desc: "Fastest & total boss kills",
			},
			{
				label: "Mob Kills",
				to: "/leaderboards/mob-kills",
				desc: "Overall mob slayers",
			},
			{
				label: "Events Completed",
				to: "/leaderboards/events",
				desc: "Seasonal & world events",
			},
		],
	},
	{
		title: "Combat",
		items: [
			{
				label: "Attack",
				to: "/leaderboards/attack",
				desc: "Top attack level & XP",
			},
			{
				label: "Strength",
				to: "/leaderboards/strength",
				desc: "Top strength level & XP",
			},
			{
				label: "Defense",
				to: "/leaderboards/defense",
				desc: "Top defense level & XP",
			},
			{
				label: "Accuracy",
				to: "/leaderboards/accuracy",
				desc: "Top accuracy level & XP",
			},
		],
	},
	{
		title: "Crafting & Industry",
		items: [
			{
				label: "Crafting",
				to: "/leaderboards/crafting",
				desc: "Makers & artisans",
			},
			{
				label: "Mining",
				to: "/leaderboards/mining",
				desc: "Ore masters",
			},
			{
				label: "Blacksmithing",
				to: "/leaderboards/blacksmithing",
				desc: "Forge legends",
			},
			{
				label: "Farming",
				to: "/leaderboards/farming",
				desc: "Harvest champions",
			},
		],
	},
	{
		title: "Economy",
		items: [
			{
				label: "Wealth",
				to: "/leaderboards/wealth",
				desc: "Net worth rankings",
			},
			{
				label: "Trading",
				to: "/leaderboards/trading",
				desc: "Market movers",
			},
			{
				label: "Bounties",
				to: "/leaderboards/bounties",
				desc: "Most wanted",
			},
		],
	},
];

const LeaderboardsMegaMenu = () => {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef(null);
	const panelRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		const onDoc = (e) => {
			if (
				panelRef.current &&
				!panelRef.current.contains(e.target) &&
				triggerRef.current &&
				!triggerRef.current.contains(e.target)
			) {
				setOpen(false);
			}
		};
		const onEsc = (e) => {
			if (e.key === "Escape") {
				setOpen(false);
				triggerRef.current?.focus();
			}
		};
		document.addEventListener("mousedown", onDoc);
		document.addEventListener("keydown", onEsc);
		return () => {
			document.removeEventListener("mousedown", onDoc);
			document.removeEventListener("keydown", onEsc);
		};
	}, [open]);

	const onTriggerKeyDown = (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			setOpen((o) => !o);
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			setOpen(true);
			const firstLink = panelRef.current?.querySelector("a");
			firstLink?.focus();
		}
	};
	return (
		<div
			className={`mega-wrap ${open ? "is-open" : ""}`}
		>
			<div
				ref={triggerRef}
				className="box-nav-button mega-trigger"
				aria-haspopup="true"
				aria-expanded={open}
				aria-controls="leaderboards-mega"
				onClick={() => setOpen((o) => !o)}
				onKeyDown={onTriggerKeyDown}
				style={{ cursor: "pointer" }}
			>
				Leaderboards{" "}
				{!open ? (
					<ChevronDownIcon width={"12px"} />
				) : (
					<ChevronUpIcon width={"12px"} />
				)}
			</div>

			{open && (
				<div
					id="leaderboards-mega"
					ref={panelRef}
					role="menu"
					className="mega-panel"

				>
					<div className="mega-grid">
						{sections.map((section) => (
							<section className="mega-col" key={section.title}>
								<h4 className="mega-heading">
									{section.title}
								</h4>
								<ul className="mega-list">
									{section.items.map((it) => (
										<li key={it.to} className="mega-item">
											<Link
												className="mega-link"
												to={it.to}
												role="menuitem"
												tabIndex={0}
											>
												<span className="mega-link-label">
													{it.label}
												</span>
												<span className="mega-link-desc">
													{it.desc}
												</span>
											</Link>
										</li>
									))}
								</ul>
							</section>
						))}
					</div>
					<div className="mega-footer">
						<Link to="/leaderboards" className="mega-cta">
							View all leaderboards
						</Link>
					</div>
				</div>
			)}
		</div>
	);
};

export default LeaderboardsMegaMenu;
