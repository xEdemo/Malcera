import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Empty string due to proxy
const baseQuery = fetchBaseQuery({ baseUrl: '' });

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Battle', 'Inventory'],
    endpoints: (builder) => ({}),
});
