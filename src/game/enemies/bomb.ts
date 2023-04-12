import { ENEMY_BOMB } from "../constants";
import { randInRange } from "../math";
import { Particle } from "../particle";
import { Vector } from "../vector";
import { FreefallEnemy } from "./freefallEnemy";

export const BOMB_RADIUS = 0.15;

export class Bomb extends FreefallEnemy {
	velocity: Vector;

	constructor(center: Vector, velocity: Vector) {
		super(ENEMY_BOMB, center, BOMB_RADIUS, 0);
		this.velocity = velocity;
	}

	onDeath() {
		const position = this.getShape().getCenter();

		for (let i = 0; i < 50; ++i) {
			const direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(
				randInRange(0.5, 7)
			);

			Particle()
				.position(position)
				.velocity(direction)
				.radius(0.02, 0.15)
				.bounces(0, 4)
				.elasticity(0.05, 0.9)
				.decay(0.00001, 0.0001)
				.expand(1.0, 1.2)
				.color(1, 0.5, 0, 1)
				.mixColor(1, 1, 0, 1)
				.triangle();
		}

		// white center
		// collide should be false on this
		Particle()
			.position(position)
			.radius(0.1)
			.bounces(0)
			.gravity(false)
			.decay(0.000001)
			.expand(10)
			.color(1, 1, 1, 5)
			.circle();
	}
}
