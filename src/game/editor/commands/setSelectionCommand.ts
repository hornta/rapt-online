import { BasePlaceable } from "../placeables/placeable";
import { World } from "../world";
import { Command } from "./command";

export class SetSelectionCommand extends Command {
	world: World;
	selection: BasePlaceable[];
	oldSelection: BasePlaceable[];

	constructor(world: World, selection: BasePlaceable[]) {
		super();
		this.world = world;
		this.oldSelection = world.getSelection();
		this.selection = selection;
	}

	undo() {
		this.world.setSelection(this.oldSelection);
	}

	redo() {
		this.world.setSelection(this.selection);
	}

	mergeWith(command: Command) {
		if (command instanceof SetSelectionCommand) {
			this.selection = command.selection;
			return true;
		}
		return false;
	}
}
