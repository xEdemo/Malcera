import { apiSlice } from '../apiSlice.js';
import { INVENTORY_URL } from '../rootRoutes.js';

export const inventoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        updateInventoryOnDrop: builder.mutation({
            query: (data) => ({
                url: `${INVENTORY_URL}/on-drop`,
                method: 'PUT',
                body: data,
            }),
        }),
        getInventory: builder.query({
            query: (data) => ({
                url: `${INVENTORY_URL}`,
                method: 'GET',
                body: data,
            }),
        }),
        splitStack: builder.mutation({
            query: (data) => ({
                url: `${INVENTORY_URL}/split`,
                method: 'PUT',
                body: data,
            }),
        }),
        combineStack: builder.mutation({
            query: (data) => ({
                url: `${INVENTORY_URL}/combine`,
                method: `PUT`,
                body: data,
            }),
        }),
        removeItem: builder.mutation({
            query: (data) => ({
                url: `${INVENTORY_URL}/remove`,
                method: 'PUT',
                body: data,
            }),
        }),
    }),
});

export const {
    useUpdateInventoryOnDropMutation,
    useGetInventoryQuery,
    useSplitStackMutation,
    useCombineStackMutation,
    useRemoveItemMutation,
} = inventoryApiSlice;
