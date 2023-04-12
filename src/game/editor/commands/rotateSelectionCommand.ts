import { BasePlaceable } from "../placeables/placeable";
import { World } from "../world";
import { Command } from "./command";

export class RotateSelectionCommand extends Command {
	world: World;
	deltaAngle: number;
	oldAngles: number[];
	selection: BasePlaceable[];

	constructor(world: World, deltaAngle: number) {
		super();

		this.world = world;
		this.deltaAngle = deltaAngle;
		this.oldAngles = [];
		this.selection = world.getSelection();
		for (let i = 0; i < this.selection.length; i++) {
			this.oldAngles.push(this.selection[i].getAngle());
		}
	}

	undo() {
		for (let i = 0; i < this.selection.length; i++) {
			this.selection[i].setAngle(this.oldAngles[i]);
		}
	}

	redo() {
		for (let i = 0; i < this.selection.length; i++) {
			this.selection[i].setAngle(this.oldAngles[i] + this.deltaAngle);
		}
	}

	mergeWith(command: Command) {
		if (command instanceof RotateSelectionCommand) {
			this.deltaAngle += command.deltaAngle;
			return true;
		}
		return false;
	}
}
