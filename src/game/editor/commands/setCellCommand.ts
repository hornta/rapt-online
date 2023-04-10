import { World } from "../world.js";
import { Command } from "./command.js";

export class SetCellCommand extends Command {
	world: World;
	x: number;
	y: number;
	type: 0 | 1 | 2 | 3 | 4 | 5;
	oldType: 0 | 1 | 2 | 3 | 4 | 5;

	constructor(world: World, x: number, y: number, type: 0 | 1 | 2 | 3 | 4 | 5) {
		super();

		this.world = world;
		this.x = x;
		this.y = y;
		this.type = type;
		this.oldType = world.getCell(x, y);
	}

	undo() {
		this.world.setCell(this.x, this.y, this.oldType);
	}

	redo() {
		this.world.setCell(this.x, this.y, this.type);
	}

	mergeWith(command: Command) {
		if (
			command instanceof SetCellCommand &&
			this.x === command.x &&
			this.y === command.y &&
			this.type === command.type
		) {
			return true;
		}
		return false;
	}
}
