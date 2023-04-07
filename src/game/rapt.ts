import { LevelData } from "../schemas.js";
import { Level } from "./level.js";

export const startGame = (
	canvas: HTMLCanvasElement,
	levelData: LevelData,
	width: number,
	height: number
) => {
	const level = new Level(canvas, width, height);
	level.load(levelData);
	const tick = () => {
		level.tick();
	};

	tick();
	const handle = setInterval(tick, 1000 / 60);

	return {
		destroy: () => {
			clearInterval(handle);
			level.destroy();
		},
		resize(width: number, height: number) {
			level.resize(width, height);
		},
	};
};
