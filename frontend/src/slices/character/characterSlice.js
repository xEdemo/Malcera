import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CHARACTER_URL } from '../rootRoutes';

export const getCharacter = createAsyncThunk(
    'character/getCharacter',
    async () => {
        const response = await fetch(`${CHARACTER_URL}`);
        const data = await response.json();
        return data;
    }
);

const initialState = null;

const characterSlice = createSlice({
    name: 'Character',
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(getCharacter.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(getCharacter.rejected, (state, action) => {
                console.error('Error fetching character:', action.error);
                return null;
            });
    }
});

export default characterSlice.reducer;