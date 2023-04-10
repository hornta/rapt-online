import { Command } from "./command.js";

export class MacroCommand extends Command {
	commands: Command[];

	constructor() {
		super();

		this.commands = [];
	}

	undo() {
		for (let i = this.commands.length - 1; i >= 0; i--) {
			this.commands[i].undo();
		}
	}

	redo() {
		for (let i = 0; i < this.commands.length; i++) {
			this.commands[i].redo();
		}
	}

	mergeWith() {
		return false;
	}
}
