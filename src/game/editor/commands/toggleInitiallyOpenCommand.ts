import { Door } from "../placeables/door.js";
import { Command } from "./command.js";

export class ToggleInitiallyOpenCommand extends Command {
	door: Door;
	isInitiallyOpen: boolean;

	constructor(door: Door) {
		super();

		this.door = door;
		this.isInitiallyOpen = door.isInitiallyOpen;
	}

	undo() {
		this.door.isInitiallyOpen = this.isInitiallyOpen;
	}

	redo() {
		this.door.isInitiallyOpen = !this.isInitiallyOpen;
	}

	mergeWith() {
		return false;
	}
}
