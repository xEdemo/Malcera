import { apiSlice } from "../apiSlice.js";
import { CHARACTER_URL } from "../rootRoutes.js";

export const characterApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		updateCharacterOnEquip: builder.mutation({
			query: (data) => ({
				url: `${CHARACTER_URL}/on-equip`,
				method: "PUT",
				body: data,
			}),
		}),
		unequipOnClick: builder.mutation({
			query: (data) => ({
				url: `${CHARACTER_URL}/unequip-click`,
				method: "PUT",
				body: data,
			}),
		}),
	}),
});

export const { useUpdateCharacterOnEquipMutation, useUnequipOnClickMutation } =
	characterApiSlice;
