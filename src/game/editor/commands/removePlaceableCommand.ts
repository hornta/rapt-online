import { BasePlaceable } from "../placeables/placeable";
import { World } from "../world";
import { Command } from "./command";

export class RemovePlaceableCommand extends Command {
	world: World;
	placeable: BasePlaceable;

	constructor(world: World, placeable: BasePlaceable) {
		super();

		this.world = world;
		this.placeable = placeable;
	}

	undo() {
		this.world.addPlaceable(this.placeable);
	}

	redo() {
		this.world.removePlaceable(this.placeable);
	}

	mergeWith() {
		return false;
	}
}
