import { Vector } from "../../vector.js";
import { World } from "../world.js";
import { Command } from "./command.js";

export class SetPlayerGoalCommand extends Command {
	world: World;
	playerGoal: Vector;
	oldPlayerGoal: Vector;

	constructor(world: World, playerGoal: Vector) {
		super();

		this.world = world;
		this.playerGoal = playerGoal;
		this.oldPlayerGoal = world.playerGoal;
	}

	undo() {
		this.world.playerGoal = this.oldPlayerGoal;
	}

	redo() {
		this.world.playerGoal = this.playerGoal;
	}

	mergeWith(command: Command) {
		if (command instanceof SetPlayerGoalCommand) {
			this.playerGoal = command.playerGoal;
			return true;
		}
		return false;
	}
}
