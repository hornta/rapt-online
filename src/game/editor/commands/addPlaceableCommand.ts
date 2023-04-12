import { BasePlaceable } from "../placeables/placeable";
import { World } from "../world";
import { Command } from "./command";

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
