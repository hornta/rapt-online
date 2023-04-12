import { Vector } from "../../vector";
import { BasePlaceable } from "../placeables/placeable";
import { World } from "../world";
import { Command } from "./command";

export class MoveSelectionCommand extends Command {
	world: World;
	delta: Vector;
	oldAnchors: Vector[];
	selection: BasePlaceable[];

	constructor(world: World, delta: Vector) {
		super();

		this.world = world;
		this.delta = delta;
		this.oldAnchors = [];
		this.selection = world.getSelection();
		for (let i = 0; i < this.selection.length; i++) {
			this.oldAnchors.push(this.selection[i].getAnchor()!);
		}
	}

	undo() {
		for (let i = 0; i < this.selection.length; i++) {
			this.selection[i].setAnchor(this.oldAnchors[i]);
		}
	}

	redo() {
		for (let i = 0; i < this.selection.length; i++) {
			this.selection[i].setAnchor(this.oldAnchors[i].add(this.delta));
		}
	}

	mergeWith(command: Command) {
		if (command instanceof MoveSelectionCommand) {
			this.delta = this.delta.add(command.delta);
			return true;
		}
		return false;
	}
}
