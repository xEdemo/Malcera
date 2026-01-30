import { ITEM_URL } from "../rootRoutes";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchItems = createAsyncThunk(
	"item/fetchItems",
	async (_, { rejectWithValue }) => {
		try {
			const res = await axios.get(`${ITEM_URL}`, {
				withCredentials: true,
			});
			return res.data.items;
		} catch (error) {
			return rejectWithValue(error.response.data.message);
		}
	}
);

export const createItem = createAsyncThunk(
	"item/createItem",
	async (data, { rejectWithValue }) => {
		try {
			const res = await axios.post(`${ITEM_URL}`, data, {
				withCredentials: true,
			});
			return res.data;
		} catch (error) {
			return rejectWithValue(error.response.data.message);
		}
	}
);

export const updateItem = createAsyncThunk(
	"item/updateItem",
	async ({ itemId, data }, { rejectWithValue }) => {
		try {
			const res = await axios.put(`${ITEM_URL}/${itemId}`, data, {
				withCredentials: true,
			});
			return res.data;
		} catch (error) {
			return rejectWithValue(error.response.data.message);
		}
	}
);

export const deleteItem = createAsyncThunk(
	"item/deleteItem",
	async (itemId, { rejectWithValue }) => {
		try {
			const res = await axios.delete(`${ITEM_URL}/${itemId}`, {
				withCredentials: true,
			});
			return { itemId, msg: res.data.msg };
		} catch (error) {
			return rejectWithValue(error.response.data.message);
		}
	}
);

const itemSlice = createSlice({
	name: "item",
	initialState: {
		items: null,
		loading: null,
		error: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		// Fetch Items
		builder
			.addCase(fetchItems.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchItems.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchItems.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create Item
		builder
			.addCase(createItem.pending, (state) => {
				state.loading = true;
			})
			.addCase(createItem.fulfilled, (state, action) => {
				state.loading = false;
				// If items is already an array, add the new item to it.
				// Otherwise, initialize items as an array with the new item.
				if (state.items) {
					state.items.push(action.payload);
				} else {
					state.items = [action.payload];
				}
			})
			.addCase(createItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Update Item
		builder
			.addCase(updateItem.pending, (state) => {
				state.loading = true;
			})
			.addCase(updateItem.fulfilled, (state, action) => {
				state.loading = false;
				// Find the index of the updated item and replace it in the array.
				if (state.items) {
					const index = state.items.findIndex(
						(item) => item._id === action.payload._id
					);
					if (index !== -1) {
						state.items[index] = action.payload;
					}
				}
			})
			.addCase(updateItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Delete Item
		builder
			.addCase(deleteItem.pending, (state) => {
				state.loading = true;
			})
			.addCase(deleteItem.fulfilled, (state, action) => {
				state.loading = false;
				// Remove the deleted item from the state.items array
				state.items = state.items.filter(
					(item) => item._id !== action.payload.itemId
				);
			})
			.addCase(deleteItem.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export default itemSlice.reducer;
