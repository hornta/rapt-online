import { LevelData } from "@/schemas";
import { World } from "../world";
import { Command } from "./command";

export class ClearCommand extends Command {
	world: World;
	levelData: LevelData;

	constructor(world: World) {
		super();

		this.world = world;
		this.levelData = world.toJSON();
	}

	undo() {
		this.world.fromJSON(this.levelData);
	}

	redo() {
		this.world.setDefault();
	}

	mergeWith() {
		return false;
	}
}
