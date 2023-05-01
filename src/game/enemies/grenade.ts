import { ENEMY_GRENADE } from "../constants";
import { randInRange } from "../math";
import { Particle } from "../particle";
import { Vector } from "../vector";
import { FreefallEnemy } from "./freefallEnemy";

const GRENADE_LIFETIME = 5;
const GRENADE_RADIUS = 0.2;
const GRENADE_ELASTICITY = 0.5;

export class Grenade extends FreefallEnemy {
	timeUntilExplodes: number;

	constructor(center: Vector, direction: number, speed: number) {
		super(ENEMY_GRENADE, center, GRENADE_RADIUS, GRENADE_ELASTICITY);

		this.velocity = new Vector(
			speed * Math.cos(direction),
			speed * Math.sin(direction)
		);
		this.timeUntilExplodes = GRENADE_LIFETIME;
	}

	override draw(c: CanvasRenderingContext2D) {
		const position = this.getShape().getCenter();
		const percentUntilExplodes = this.timeUntilExplodes / GRENADE_LIFETIME;

		// draw the expanding dot in the center
		c.fillStyle = "black";
		c.beginPath();
		c.arc(
			position.x,
			position.y,
			(1 - percentUntilExplodes) * GRENADE_RADIUS,
			0,
			Math.PI * 2,
			false
		);
		c.fill();

		// draw the rim
		c.strokeStyle = "black";
		c.beginPath();
		c.arc(position.x, position.y, GRENADE_RADIUS, 0, Math.PI * 2, false);
		c.stroke();
	}

	// Grenades have a Tick that counts until their explosion
	override tick(seconds: number) {
		this.timeUntilExplodes -= seconds;

		if (this.timeUntilExplodes <= 0) {
			this.isDead = true;
		}

		FreefallEnemy.prototype.tick.call(this, seconds);
	}

	// Grenades bounce around, and are not destroyed by edges like other FreefallEnemies
	override reactToWorld() {}

	override onDeath() {
		const position = this.getCenter();

		// fire
		for (let i = 0; i < 100; i++) {
			const direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(
				randInRange(1, 10)
			);

			Particle()
				.position(position)
				.velocity(direction)
				.radius(0.1, 0.2)
				.bounces(0, 4)
				.elasticity(0.05, 0.9)
				.decay(0.0001, 0.001)
				.expand(1, 1.2)
				.color(1, 0.25, 0, 1)
				.mixColor(1, 0.5, 0, 1)
				.triangle();
		}

		// smoke
		for (let i = 0; i < 50; i++) {
			let direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
			direction = new Vector(0, 1).add(direction.mul(randInRange(0.25, 1)));

			Particle()
				.position(position)
				.velocity(direction)
				.radius(0.1, 0.2)
				.bounces(1, 3)
				.elasticity(0.05, 0.9)
				.decay(0.0005, 0.1)
				.expand(1.1, 1.3)
				.color(0, 0, 0, 1)
				.mixColor(0.5, 0.5, 0.5, 1)
				.circle()
				.gravity(-0.4, 0);
		}
	}
}
