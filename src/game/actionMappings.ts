import { gameState } from "./game";
import { GameState } from "./gameState";
import { Player } from "./player";

export const actionMappings = {
	killKey: "k", // k key

	// player a
	"a-jumpKey": "ArrowUp", // up arrow key
	"a-crouchKey": "ArrowDown", // down arrow key
	"a-leftKey": "ArrowLeft", // left arrow key
	"a-rightKey": "ArrowRight", // right arrow key

	// player b
	"b-jumpKey": "w", // w key
	"b-crouchKey": "s", // s key
	"b-leftKey": "a", // a key
	"b-rightKey": "d", // d key
};

type ActionMappings = typeof actionMappings;

type ReversedActionMappings = {
	[key in ActionMappings[keyof ActionMappings]]: keyof ActionMappings;
};

const keyToAction: ReversedActionMappings = {} as any;
for (const [key, value] of Object.entries(actionMappings)) {
	keyToAction[value] = key as any;
}

type BooleanKeys<T> = {
	[k in keyof T]: T[k] extends boolean ? k : never;
}[keyof T];
type PlayerBooleans = { [k in BooleanKeys<Player>]: boolean };
type GameStateBooleans = { [k in BooleanKeys<GameState>]: boolean };

export const updateAction = (key: string, value: boolean) => {
	const action = keyToAction[key];
	if (action !== undefined) {
		if (action.startsWith("a-")) {
			const playerAction = action.slice(2) as keyof PlayerBooleans;
			gameState.playerA[playerAction] = value;
		} else if (action.startsWith("b-")) {
			const playerAction = action.slice(2) as keyof PlayerBooleans;
			gameState.playerB[playerAction] = value;
		} else {
			gameState[action as keyof GameStateBooleans] = value;
		}
	}
};
