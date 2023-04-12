import { AABB } from "./aabb";
import { ENEMY_HELP_SIGN, GAME_SCALE } from "./constants";
import { Enemy } from "./enemy";
import { drawTextBox } from "./utils";
import { Vector } from "./vector";

const HELP_SIGN_TEXT_WIDTH = 1.5;
const HELP_SIGN_WIDTH = 0.76;
const HELP_SIGN_HEIGHT = 0.76;

// Help signs take in an array of strings, each string in the array is drawn
// on its own line.
export class HelpSign extends Enemy {
	hitBox: AABB;
	textArray: string[] | null;
	text: string;
	drawText: boolean;
	timeSinceStart: number;
	textWidth: number;
	constructor(center: Vector, text: string, width?: number) {
		super(ENEMY_HELP_SIGN, 0);
		this.hitBox = AABB.makeAABB(center, HELP_SIGN_WIDTH, HELP_SIGN_HEIGHT);
		this.textArray = null;
		this.text = text;
		this.drawText = false;
		this.timeSinceStart = 0;
		if (width === undefined) {
			this.textWidth = HELP_SIGN_TEXT_WIDTH;
		} else {
			this.textWidth = width;
		}
	}

	splitUpText(c: CanvasRenderingContext2D, phrase: string) {
		const words = phrase.split(" ");
		const phraseArray = [];
		let lastPhrase = "";
		c.font = "12px sans serif";
		const maxWidth = this.textWidth * GAME_SCALE;
		let measure = 0;
		for (let i = 0; i < words.length; ++i) {
			const word = words[i];
			measure = c.measureText(lastPhrase + word).width;
			if (measure < maxWidth) {
				lastPhrase += " " + word;
			} else {
				if (lastPhrase.length > 0) {
					phraseArray.push(lastPhrase);
				}
				lastPhrase = word;
			}
			if (i === words.length - 1) {
				phraseArray.push(lastPhrase);
				break;
			}
		}
		return phraseArray;
	}

	getShape() {
		return this.hitBox;
	}

	canCollide() {
		return false;
	}

	tick(seconds: number) {
		this.timeSinceStart += seconds;
		this.drawText = false;
		Enemy.prototype.tick.call(this, seconds);
	}

	reactToPlayer() {
		this.drawText = true;
	}

	draw(c: CanvasRenderingContext2D) {
		// split up the text into an array the first call
		if (this.textArray === null) {
			this.textArray = this.splitUpText(c, this.text);
		}
		const pos = this.getCenter();

		c.save();
		c.textAlign = "center";
		c.scale(1 / GAME_SCALE, -1 / GAME_SCALE);

		c.save();
		// Draw the sprite
		c.font = "bold 34px sans-serif";
		c.lineWidth = 1;
		c.fillStyle = "yellow";
		c.strokeStyle = "black";
		c.translate(pos.x * GAME_SCALE, -pos.y * GAME_SCALE + 12);
		const timeFloor = Math.floor(this.timeSinceStart);

		/* 2 second period version
		var scale = this.timeSinceStart;
		if (timeFloor % 2 === 0) {
			scale -= timeFloor;
		} else {
			scale -= 1 + timeFloor;
		}
		scale = Math.cos(scale * Math.PI) / 9 + 1; */

		let scaleFactor = this.timeSinceStart - timeFloor;
		scaleFactor = Math.cos(scaleFactor * 2 * Math.PI) / 16 + 1;

		// Convert from 0-2 to 1 - 1/16 to 1 + 1/16
		c.scale(scaleFactor, scaleFactor);
		c.fillText("?", 0, 0);
		c.strokeText("?", 0, 0);
		c.restore();

		// Draw the text in a text box
		if (this.drawText) {
			const fontSize = 13;
			const xCenter = pos.x * GAME_SCALE;
			const yCenter =
				-(pos.y + 0.5) * GAME_SCALE -
				((fontSize + 2) * this.textArray.length) / 2;
			drawTextBox(c, this.textArray, xCenter, yCenter, fontSize);
		}

		c.restore();
	}
}
