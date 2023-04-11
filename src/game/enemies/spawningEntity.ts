import { AABB } from "../aabb.js";
import { Enemy } from "../enemy.js";
import { Player } from "../player.js";
import { Vector } from "../vector.js";

export abstract class SpawningEnemy extends Enemy {
	spawnFrequency: number;
	timeUntilNextSpawn: number;
	hitBox: AABB;

	constructor(
		type: number,
		center: Vector,
		width: number,
		height: number,
		elasticity: number,
		frequency: number,
		startingTime: number
	) {
		super(type, elasticity);
		this.spawnFrequency = frequency;

		// Time until next enemy gets spawned
		this.timeUntilNextSpawn = startingTime;
		this.hitBox = AABB.makeAABB(center, width, height);
	}

	getShape() {
		return this.hitBox;
	}

	// return a number between 0 and 1 indicating how ready we are for
	// the next spawn (0 is just spawned and 1 is about to spawn)
	getReloadPercentage() {
		return 1 - this.timeUntilNextSpawn / this.spawnFrequency;
	}

	// Special tick to include a step to spawn enemies
	tick(seconds: number) {
		this.timeUntilNextSpawn -= seconds;

		if (this.timeUntilNextSpawn <= 0) {
			// If an enemy is spawned, increase the time by the spawn frequency
			if (this.spawn()) {
				this.timeUntilNextSpawn += this.spawnFrequency;
			} else {
				this.timeUntilNextSpawn = 0;
			}
		}

		Enemy.prototype.tick.call(this, seconds);
	}

	// Subclasses of this should overwrite Spawn() to spawn the right type of enemy
	// Returns true iff an enemy is actually spawned
	abstract spawn(): boolean;

	reactToPlayer(player: Player): void {}
}
