import { EventEmitter } from "@/utils/EventEmitter";
import { Command } from "./commands/command";
import { MacroCommand } from "./commands/macroCommand";

export class UndoStack extends EventEmitter<{
	undo: () => void;
	redo: () => void;
	command: (command: Command) => void;
}> {
	commands: Command[];
	macros: MacroCommand[];
	currentIndex: number;
	cleanIndex: number;

	constructor() {
		super();

		this.commands = [];
		this.macros = [];
		this.currentIndex = 0;
		this.cleanIndex = 0;
	}

	#push(command: Command) {
		// Only push the macro if it's non-empty, otherwise it leads to weird behavior
		if (command instanceof MacroCommand && command.commands.length === 0) {
			return;
		}

		if (this.macros.length === 0) {
			// Remove all commands after our position in the undo buffer (these are
			// ones we have undone, and once we do something else we shouldn't be able
			// to redo these anymore)
			this.commands = this.commands.slice(0, this.currentIndex);

			// If we got to the current position by undoing from a clean state, set
			// the clean state to invalid because we won't be able to get there again
			if (this.cleanIndex > this.currentIndex) {
				this.cleanIndex = -1;
			}

			this.commands.push(command);
			this.currentIndex++;
		} else {
			// Merge adjacent commands together in the same macro by calling mergeWith()
			// on the previous command and passing it the next command.  If it returns
			// true, the information from the next command has been merged with the
			// previous command and we can forget about the next command (so we return
			// instead of pushing it).
			const commands = this.macros[this.macros.length - 1].commands;
			if (commands.length > 0) {
				const prevCommand = commands[commands.length - 1];
				if ("mergeWith" in prevCommand && prevCommand.mergeWith(command)) {
					return;
				}
			}

			commands.push(command);
		}
	}

	push(command: Command) {
		this.#push(command);
		command.redo();
		this.emit("command", command);
	}

	canUndo() {
		return this.macros.length === 0 && this.currentIndex > 0;
	}

	canRedo() {
		return this.macros.length === 0 && this.currentIndex < this.commands.length;
	}

	beginMacro() {
		this.macros.push(new MacroCommand());
	}

	endMacro() {
		if (this.macros.length > 0) {
			this.#push(this.macros.pop()!);
		}
	}

	endAllMacros() {
		while (this.macros.length > 0) {
			this.endMacro();
		}
	}

	undo() {
		if (this.canUndo()) {
			this.commands[--this.currentIndex].undo();
			this.emit("undo");
		}
	}

	redo() {
		if (this.canRedo()) {
			this.commands[this.currentIndex++].redo();
			this.emit("redo");
		}
	}

	getCurrentIndex() {
		return this.currentIndex;
	}

	setCleanIndex(index: number) {
		this.cleanIndex = index;
	}

	clear() {
		this.macros = [];
		this.commands = [];
		this.currentIndex = this.cleanIndex = 0;
	}
}
