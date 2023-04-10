import { BasePlaceable } from "../placeables/placeable.js";
import { World } from "../world.js";
import { Command } from "./command.js";

export class AddPlaceableCommand extends Command {
	world: World;
	placeable: BasePlaceable;

	constructor(world: World, placeable: BasePlaceable) {
		super();

		this.world = world;
		this.placeable = placeable;
	}

	undo() {
		this.world.removePlaceable(this.placeable);
	}

	redo() {
		this.world.addPlaceable(this.placeable);
	}

	mergeWith() {
		return false;
	}
}
