import { ENEMY_LASER } from "../constants";
import { randInRange } from "../math";
import { Particle } from "../particle";
import { Segment } from "../segment";
import { Vector } from "../vector";
import { FreefallEnemy } from "./freefallEnemy";

const LASER_RADIUS = 0.15;
const LASER_SPEED = 5;
const LASER_BOUNCES = 0;

export class Laser extends FreefallEnemy {
	bouncesLeft: number;

	constructor(center: Vector, direction: number) {
		super(ENEMY_LASER, center, LASER_RADIUS, 1);

		this.bouncesLeft = LASER_BOUNCES;
		this.velocity = new Vector(
			LASER_SPEED * Math.cos(direction),
			LASER_SPEED * Math.sin(direction)
		);
	}

	override move(seconds: number) {
		return this.velocity.mul(seconds);
	}

	override reactToWorld() {
		if (this.bouncesLeft <= 0) {
			this.isDead = true;

			const position = this.getCenter();
			for (let i = 0; i < 20; ++i) {
				const angle = randInRange(0, 2 * Math.PI);
				let direction = Vector.fromAngle(angle);
				direction = direction.mul(randInRange(0.5, 5));

				Particle()
					.position(position)
					.velocity(direction)
					.angle(angle)
					.radius(0.1)
					.bounces(1)
					.elasticity(1)
					.decay(0.01)
					.gravity(0)
					.color(1, 1, 1, 1)
					.line();
			}
		} else {
			--this.bouncesLeft;
		}
	}

	override draw(c: CanvasRenderingContext2D) {
		const heading = this.velocity.unit().mul(LASER_RADIUS);
		const segment = new Segment(
			this.getCenter().sub(heading),
			this.getCenter().add(heading)
		);
		c.lineWidth = 0.07;
		c.strokeStyle = "white";
		segment.draw(c);
		c.lineWidth = 0.02;
	}
}
