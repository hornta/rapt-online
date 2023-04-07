import { Camera } from "./camera.js";
import {
	GAME_IN_PLAY,
	GAME_WON,
	STAT_COGS_COLLECTED,
	STAT_NUM_COGS,
	GAME_LOST,
	GAME_SCALE,
} from "./constants.js";
import { GameState } from "./gameState.js";
import { updateInput } from "./input.js";
import { lerp } from "./math.js";
import { Particle } from "./particle.js";
import { drawTextBox } from "./utils.js";

// text constants
const GAME_WIN_TEXT =
	"You won!  Hit SPACE to play the next level or ESC for the level selection menu.";
const GOLDEN_COG_TEXT = "You earned a golden cog!";
const SILVER_COG_TEXT = "You earned a silver cog!";
const GAME_LOSS_TEXT =
	"You lost.  Hit SPACE to restart, or ESC to select a new level.";
const TEXT_BOX_X_MARGIN = 6;
const TEXT_BOX_Y_MARGIN = 6;
const SECONDS_BETWEEN_TICKS = 1 / 60;

export let gameState: GameState;

export class Game {
	camera: Camera;
	fps: number;
	fixedPhysicsTick: number;
	isDone: boolean;
	onWin: null | (() => void);
	width: number;
	height: number;

	constructor() {
		this.fps = 0;
		this.fixedPhysicsTick = 0;

		this.isDone = false;
		this.onWin = null;

		gameState = new GameState();
	}

	resize(w: number, h: number) {
		this.width = w;
		this.height = h;
		this.camera = new Camera(
			gameState.playerA,
			gameState.playerB,
			w / GAME_SCALE,
			h / GAME_SCALE
		);
	}

	destroy() {
		this.camera.destroy();
	}

	tick(seconds: number) {
		updateInput();
		let count = 0;
		this.fixedPhysicsTick += seconds;
		while (++count <= 3 && this.fixedPhysicsTick >= 0) {
			this.fixedPhysicsTick -= SECONDS_BETWEEN_TICKS;
			gameState.tick(SECONDS_BETWEEN_TICKS);
			Particle.tick(SECONDS_BETWEEN_TICKS);
		}

		// smooth the fps a bit
		this.fps = lerp(this.fps, 1 / seconds, 0.05);

		// handle winning the game
		if (!this.isDone && gameState.gameStatus !== GAME_IN_PLAY) {
			this.isDone = true;
			if (gameState.gameStatus === GAME_WON && this.onWin) {
				this.onWin();
			}
		}
	}

	draw(c: CanvasRenderingContext2D) {
		// draw the game
		c.save();
		c.translate(this.width / 2, this.height / 2);
		c.scale(GAME_SCALE, -GAME_SCALE);
		c.lineWidth = 1 / GAME_SCALE;
		this.camera.draw(c);
		c.restore();

		if (gameState.gameStatus === GAME_WON) {
			// draw winning text
			c.save();
			const cogsCollectedText =
				"Cogs Collected: " +
				gameState.stats[STAT_COGS_COLLECTED] +
				"/" +
				gameState.stats[STAT_NUM_COGS];
			drawTextBox(c, [cogsCollectedText], this.width / 2, this.height / 2, 14);
			c.restore();
		} else if (gameState.gameStatus === GAME_LOST) {
			// draw losing text
			c.save();
			drawTextBox(c, [GAME_LOSS_TEXT], this.width / 2, this.height / 2, 14);
			c.restore();
		}

		// draw the fps counter
		c.font = "10px Arial, sans-serif";
		c.fillStyle = "black";
		const text = this.fps.toFixed(0) + " FPS";
		c.fillText(
			text,
			this.width - 5 - c.measureText(text).width,
			this.height - 5
		);
	}
}
