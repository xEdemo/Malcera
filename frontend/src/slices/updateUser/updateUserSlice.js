import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UPDATE_USER_URL } from '../rootRoutes.js';

const initialState = null;

const updateUserSlice = createSlice({
	name: 'UpdateUser',
	initialState,
	reducers: {},
});

export default updateUserSlice.reducer;