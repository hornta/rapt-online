import { LevelData } from "../schemas.js";
import { updateInput } from "./input.js";
import { Level } from "./level.js";

export const startGame = (
	canvas: HTMLCanvasElement,
	levelData: LevelData,
	width: number,
	height: number
) => {
	const level = new Level(canvas, width, height);
	level.load(levelData);
	let handle: number;
	const tick = () => {
		level.tick();
		updateInput();

		handle = requestAnimationFrame(tick);
	};

	tick();

	return {
		destroy: () => {
			cancelAnimationFrame(handle);
			level.destroy();
		},
		resize(width: number, height: number) {
			level.resize(width, height);
		},
		level,
	};
};
