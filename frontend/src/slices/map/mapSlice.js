import { MAP_URL } from "../rootRoutes";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMaps = createAsyncThunk(
	"map/fetchMaps",
	async (_, { rejectWithValue }) => {
		try {
			const res = await axios.get(`${MAP_URL}`, {
				withCredentials: true,
			});
			return res.data.maps;
		} catch (error) {
			return rejectWithValue(error.response.data.message);
		}
	}
);

export const fetchMapByKey = createAsyncThunk(
	"map/fetchMapByKey",
	async (key, { rejectWithValue }) => {
		try {
			const res = await axios.get(`${MAP_URL}/${key}`, {
				withCredentials: true,
			});
			return res.data.map; // contains tilesBase64
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || "Error fetching maps."
			);
		}
	}
);

export const createMap = createAsyncThunk(
	"map/createMap",
	async (data, { rejectWithValue }) => {
		try {
			const res = await axios.post(`${MAP_URL}`, data, {
				withCredentials: true,
			});
			return res.data;
		} catch (error) {
			return rejectWithValue(error.response.data.message);
		}
	}
);

const mapSlice = createSlice({
	name: "map",
	initialState: {
		maps: null, // list (no tiles)
		mapByKey: {}, // full maps cache by key (with tilesBase64)
		activeKey: null,

		loading: null,
		error: null,
	},
	reducers: {
		setActiveMapKey: (state, action) => {
			state.activeKey = action.payload;
		},
		clearMapError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Fetch maps
		builder
			.addCase(fetchMaps.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchMaps.fulfilled, (state, action) => {
				state.loading = false;
				state.maps = action.payload;
			})
			.addCase(fetchMaps.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Fetch single map (with tilesBase64)
		builder
			.addCase(fetchMapByKey.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchMapByKey.fulfilled, (state, action) => {
				state.loading = false;
				const map = action.payload;
				state.mapByKey[map.key] = map; // cache by key
			})
			.addCase(fetchMapByKey.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create map
		builder
			.addCase(createMap.pending, (state) => {
				state.loading = true;
			})
			.addCase(createMap.fulfilled, (state, action) => {
				state.loading = false;

				const created = action.payload.map ?? action.payload;

				// maps list should NOT include tiles, but createMap doesn't include tiles anyway
				if (state.maps) state.maps.push(created);
				else state.maps = [created];
			})
			.addCase(createMap.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { setActiveMapKey, clearMapError } = mapSlice.actions;
export default mapSlice.reducer;
