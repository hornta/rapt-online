import { invariant } from "./invariant.js";
import { levelDataSchema } from "./schemas.js";
import { LEVEL_DATA } from "./game/levels.js";
import { Game } from "./game.js";

export const Level = () => {
	// const { levelName } = useParams();
	// invariant(levelName);
	// if (!(levelName in LEVEL_DATA)) {
	// 	return null;
	// }
	// const levelJson = JSON.parse(
	// 	LEVEL_DATA[levelName as keyof typeof LEVEL_DATA]
	// );
	// const level = levelDataSchema.parse(levelJson);
	// return <Game level={level} />;
};
