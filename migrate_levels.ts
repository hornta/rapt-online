import { PrismaClient } from "@prisma/client";
import { LEVEL_DATA } from "./src/game/levels.js";

(async () => {
	const client = new PrismaClient();
	await client.$connect();

	// await client.level.createMany({
	// 	data: Object.entries(LEVEL_DATA).map(([name, level]) => {
	// 		return {
	// 			name: name.replaceAll("_", " "),
	// 			createdBy: "",
	// 			data: JSON.parse(level),
	// 			two_players: true,
	// 			one_player: false,
	// 			description: "",
	// 		};
	// 	}),
	// });
})();
