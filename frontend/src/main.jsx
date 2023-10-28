import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from 'react-router-dom';

import store from './store.js';
import { Provider } from 'react-redux';

import {
    Landing,
    NotFound,
    LoginForm,
    SignUpForm,
    Profile,
    Game,
    Inspect,
    Battle,
} from './pages';
import { PrivateRoute, Layout } from './components';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route index={true} path="/" element={<Landing />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignUpForm />} />
            {/* Private Routes */}
            <Route path="" element={<PrivateRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route element={<Layout />}>
                    <Route path="/game" element={<Game />} />
                    <Route
                        path="/battle/inspect/:mobId"
                        element={<Inspect />}
                    />
                    <Route path="/battle/:battleId" element={<Battle />} />
                </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
        </Route>
    )
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
);
