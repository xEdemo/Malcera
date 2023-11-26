import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice.js';
import authReducer from './slices/auth/authSlice.js';
import battleReducer from './slices/battle/battleSlice.js';
import userReducer from './slices/user/userSlice.js';
import inventoryReducer from './slices/inventory/inventorySlice.js';
import { setupListeners } from '@reduxjs/toolkit/query';

const store = configureStore({
    reducer: {
        auth: authReducer,
        battle: battleReducer,
        user: userReducer,
        inventory: inventoryReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true,
});
setupListeners(store.dispatch);

export default store;
