import { gameState } from "@/game/game";
import { Shape } from "@/game/shape";
import { overlapShapes } from "./overlapShapes";

export const overlapShapePlayers = (shape: Shape) => {
	const players = [];
	if (overlapShapes(gameState.playerA.getShape(), shape)) {
		players.push(gameState.playerA);
	}
	if (overlapShapes(gameState.playerB.getShape(), shape)) {
		players.push(gameState.playerB);
	}
	return players;
};
