import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { USER_URL } from '../rootRoutes.js';

export const getUserInfo = createAsyncThunk(
	'auth/getUserInfo',
	async () => {
		const res = await fetch(`${USER_URL}/profile`);
		const data = await res.json();
		return data;
	}
)

const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
        },
        clearCredentials: (state, action) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserInfo.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(getUserInfo.rejected, (state, action) => {
                console.error('Error fetching character:', action.error);
                return null;
            });
    },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;
