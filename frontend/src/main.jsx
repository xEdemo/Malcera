import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";

import store from "./store.js";
import { Provider } from "react-redux";

import {
	Landing,
	NotFound,
	LoginForm,
	SignUpForm,
	Profile,
	Game,
	AdminDashboard,
	Items,
	ItemForm,
	Maps,
	MapForm,
} from "./pages";
import { PrivateRoute, AdminRoute, AdminLayout } from "./components";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<App />}>
			<Route index={true} path="/" element={<Landing />} />
			<Route path="/login" element={<LoginForm />} />
			<Route path="/signup" element={<SignUpForm />} />
			{/* Private Routes */}
			<Route path="" element={<PrivateRoute />}>
				<Route path="/profile" element={<Profile />} />
				<Route path="/game" element={<Game />} />
			</Route>
			{/* Admin Routes */}
			<Route path="" element={<AdminRoute />}>
				<Route path="" element={<AdminLayout />}>
					<Route path="/admin" element={<AdminDashboard />} />
					<Route path="/admin/item" element={<Items />}>
						<Route path="post" element={<ItemForm mode="post" />} />
						<Route path=":itemId" element={<ItemForm mode="put" />} />
					</Route>
					<Route path="/admin/map" element={<Maps />}>
						<Route path="post" element={<MapForm mode="post" />} />
						<Route path=":mapId" element={<MapForm mode="put" />} />
					</Route>
				</Route>
			</Route>
			<Route path="*" element={<NotFound />} />
		</Route>
	)
);

ReactDOM.createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<RouterProvider router={router} />
	</Provider>
);
