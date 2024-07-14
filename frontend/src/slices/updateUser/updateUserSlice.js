import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UPDATE_USER_URL } from '../rootRoutes.js';

export const getPosition = createAsyncThunk(
	'updateUser/getPosition',
	async () => {
		const res = await fetch(`${UPDATE_USER_URL}/position`);
		const data = await res.json();
		return data
	}
)

const initialState = null;

const updateUserSlice = createSlice({
	name: 'UpdateUser',
	initialState,
	extraReducers: (builder) => {
        builder
            .addCase(getPosition.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(getPosition.rejected, (state, action) => {
                console.error('Error fetching character:', action.error);
                return null;
            });
    }
});

export default updateUserSlice.reducer;