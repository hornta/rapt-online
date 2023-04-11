import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery(),
	endpoints: (builder) => ({
		publishLevel: builder.mutation<
			void,
			{
				name: string;
				description: string;
				one_player: boolean;
				two_players: boolean;
			}
		>({
			query: ({ description, name, one_player, two_players }) => {
				return {
					url: `api/publish-level`,
					method: "POST",
					body: { name, description, one_player, two_players },
				};
			},
		}),
	}),
});

export const { usePublishLevelMutation } = api;
