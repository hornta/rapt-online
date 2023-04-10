import { Sprite } from "../placeables/sprite.js";
import { Command } from "./command.js";

export class SetSignTextCommand extends Command {
	sign: Sprite;
	text: string;
	oldText: string;

	constructor(sign: Sprite, text: string) {
		super();

		this.sign = sign;
		this.text = text;
		this.oldText = sign.text;
	}

	undo() {
		this.sign.text = this.oldText;
	}

	redo() {
		this.sign.text = this.text;
	}

	mergeWith() {
		return false;
	}
}
