import { Navbar } from "../../components";

const NotFound = () => {
	return (
		<>
			<Navbar />
			<div className="not-found-container">
				<div>
					<h2>404 | This route does not exist</h2>
				</div>
			</div>
		</>
	);
};
export default NotFound;
