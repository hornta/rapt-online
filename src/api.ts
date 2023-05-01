import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LevelData } from "./schemas";

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
				levelData: LevelData;
			}
		>({
			query: ({ description, name, one_player, two_players, levelData }) => {
				return {
					url: `api/publish-level`,
					method: "POST",
					body: { name, description, one_player, two_players, levelData },
				};
			},
		}),
	}),
});

export const { usePublishLevelMutation } = api;
