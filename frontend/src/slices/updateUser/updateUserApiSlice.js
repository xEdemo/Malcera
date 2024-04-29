import { apiSlice } from '../apiSlice.js';
import { UPDATE_USER_URL } from '../rootRoutes.js';

export const updateUserApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		updatePosition: builder.mutation({
			query: (data) => ({
				url: `${UPDATE_USER_URL}/position`,
				method: 'PUT',
				body: data,
			}),
		}),
	}),
});

export const {
	useUpdatePositionMutation
} = updateUserApiSlice;