import { LevelData } from "../schemas.js";
import { Game, gameState } from "./game.js";
import { Particle } from "./particle.js";

export class Level {
	username: string | null;
	levelname: string | null;
	width: number;
	height: number;
	ratio: number;
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	lastTime: Date;
	game: Game;
	json: LevelData;

	constructor(canvas: HTMLCanvasElement, width: number, height: number) {
		this.username = null;
		this.levelname = null;
		this.width = width;
		this.height = height;
		this.ratio = 0;
		this.canvas = canvas;
		this.context = canvas.getContext("2d")!;
		this.lastTime = new Date();
		this.canvas.width = width;
		this.canvas.height = height;
	}

	tick() {
		const currentTime = new Date();
		const seconds = (currentTime.getTime() - this.lastTime.getTime()) / 1000;
		this.lastTime = currentTime;

		if (this.game !== null) {
			// if the computer goes to sleep, act like the game was paused
			if (seconds > 0 && seconds < 1) {
				this.game.tick(seconds);
			}

			this.game.draw(this.context);
		}
	}

	resize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		this.game.resize(width, height);
	}

	restart() {
		Particle.reset();
		this.game = new Game();
		this.game.resize(this.width, this.height);
		gameState.loadLevel(this.json);
	}

	destroy() {
		this.game.destroy();
	}

	load(levelData: LevelData) {
		this.json = levelData;
		this.restart();
	}
}
