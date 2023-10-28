import { apiSlice } from '../apiSlice.js';
import { BATTLE_URL } from '../rootRoutes.js';

export const battleApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        inspectMob: builder.query({
            query: (mobId) => ({
                url: `${BATTLE_URL}/inspect/${mobId}`,
                method: 'GET',
            }),
        }),
        createBattleInstance: builder.mutation({
            query: (mobId) => ({
                url: `${BATTLE_URL}/${mobId}`,
                method: 'POST',
            }),
        }),
        getExistingBattle: builder.query({
            query: (battleId) => ({
                url: `${BATTLE_URL}/${battleId}`,
                method: 'GET',
            }),
        }),
        performActionOnMob: builder.mutation({
            query: (battleId) => ({
                url: `${BATTLE_URL}/${battleId}`,
                method: 'PUT',
            }),
        }),
        fleeFromMob: builder.mutation({
            query: (battleId) => ({
                url: `${BATTLE_URL}/${battleId}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useInspectMobQuery,
    useCreateBattleInstanceMutation,
    useGetExistingBattleQuery,
    usePerformActionOnMobMutation,
    useFleeFromMobMutation,
} = battleApiSlice;
