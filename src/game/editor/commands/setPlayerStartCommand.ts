import { Vector } from "../../vector";
import { World } from "../world";
import { Command } from "./command";

export class SetPlayerStartCommand extends Command {
	world: World;
	playerStart: Vector;
	oldPlayerStart: Vector;

	constructor(world: World, playerStart: Vector) {
		super();

		this.world = world;
		this.playerStart = playerStart;
		this.oldPlayerStart = world.playerStart;
	}

	undo() {
		this.world.playerStart = this.oldPlayerStart;
	}

	redo() {
		this.world.playerStart = this.playerStart;
	}

	mergeWith(command: Command) {
		if (command instanceof SetPlayerStartCommand) {
			this.playerStart = command.playerStart;
			return true;
		}
		return false;
	}
}
