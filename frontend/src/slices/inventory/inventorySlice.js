import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { INVENTORY_URL } from '../rootRoutes';

export const getInventory = createAsyncThunk(
    'inventory/getInventory',
    async () => {
        const response = await fetch(`${INVENTORY_URL}`);
        const data = await response.json();
        return data;
    }
);

const initialState = null;

const inventorySlice = createSlice({
    name: 'Inventory',
    initialState,
    reducers: {
        updateInventoryOnChange: (state, action) => {
            return action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getInventory.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(getInventory.rejected, (state, action) => {
                // Handle the error or set state to null, depending on your use case
                console.error('Error fetching inventory:', action.error);
                return null;
            });
    }
})

export const { updateInventoryOnChange } = inventorySlice.actions;

export default inventorySlice.reducer;