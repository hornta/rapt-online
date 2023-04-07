import { gameState } from "../game.js";
import { randInRange } from "../math.js";
import { Particle } from "../particle.js";
import { Player } from "../player.js";
import { Sprite } from "../sprite.js";
import { adjustAngleToTarget } from "../utils.js";
import { Vector } from "../vector.js";
import { RotatingEnemy } from "./rotatingEnemy.js";

export const ROCKET_SPRITE_RED = 0;
export const ROCKET_SPRITE_BLUE = 1;

const ROCKET_SPEED = 2.5;
export const ROCKET_RADIUS = 0.15;
const ROCKET_ELASTICITY = 1;
// In seconds, the amount of time the Rocket's direction is fixed
const ROCKET_HEADING_CONSTRAINT_TIME = 0.3;
const PARTICLE_FREQUENCY = 0.03;

function drawRocket(c: CanvasRenderingContext2D) {
	const size = 0.075;
	c.strokeStyle = "black";
	c.beginPath();
	c.moveTo(-ROCKET_RADIUS, size);
	c.lineTo(ROCKET_RADIUS - size, size);
	c.lineTo(ROCKET_RADIUS, 0);
	c.lineTo(ROCKET_RADIUS - size, -size);
	c.lineTo(-ROCKET_RADIUS, -size);
	c.closePath();
	c.fill();
	c.stroke();
}

export class Rocket extends RotatingEnemy {
	sprites: [Sprite, Sprite];
	target: Player;
	maxRotation: number;
	timeUntilFree: number;
	timeUntilNextParticle: number;

	constructor(
		center: Vector,
		target: Player,
		heading: number,
		maxRotation: number,
		type: number
	) {
		super(type, center, ROCKET_RADIUS, heading, ROCKET_ELASTICITY);
		this.target = target;
		this.maxRotation = maxRotation;
		this.timeUntilFree = ROCKET_HEADING_CONSTRAINT_TIME;
		this.timeUntilNextParticle = 0;
		this.velocity = new Vector(
			ROCKET_SPEED * Math.cos(heading),
			ROCKET_SPEED * Math.sin(heading)
		);

		this.sprites = [
			new Sprite((c) => {
				c.fillStyle = "red";
				drawRocket(c);
			}),
			new Sprite((c) => {
				c.fillStyle = "blue";
				drawRocket(c);
			}),
		];
	}

	getTarget() {
		return Number(this.target === gameState.playerB);
	}

	setTarget(player: Player) {
		this.target = player;
	}

	calcHeading(seconds: number) {
		if (this.target.isDead) {
			return;
		}
		const delta = this.target.getCenter().sub(this.getCenter());
		const angle = delta.atan2();
		this.heading = adjustAngleToTarget(
			this.heading,
			angle,
			this.maxRotation * seconds
		);
	}

	move(seconds: number) {
		if (this.timeUntilFree <= 0) {
			this.calcHeading(seconds);
			this.velocity = new Vector(
				ROCKET_SPEED * Math.cos(this.heading),
				ROCKET_SPEED * Math.sin(this.heading)
			);
		} else {
			this.timeUntilFree -= seconds;
		}
		return this.velocity.mul(seconds);
	}

	afterTick(seconds: number) {
		let position = this.getCenter();
		this.sprites[ROCKET_SPRITE_RED].offsetBeforeRotation = position;
		this.sprites[ROCKET_SPRITE_BLUE].offsetBeforeRotation = position;
		this.sprites[ROCKET_SPRITE_RED].angle = this.heading;
		this.sprites[ROCKET_SPRITE_BLUE].angle = this.heading;

		position = position.sub(this.velocity.unit().mul(ROCKET_RADIUS));

		this.timeUntilNextParticle -= seconds;
		while (this.timeUntilNextParticle <= 0 && !this.isDead) {
			// must test IsDead() otherwise particles go through walls
			// add a flame
			let direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
			direction = direction.mul(randInRange(0, 2)).sub(this.velocity.mul(3));
			Particle()
				.position(position)
				.velocity(direction)
				.radius(0.1, 0.15)
				.bounces(1)
				.decay(0.000001, 0.00001)
				.expand(1.0, 1.2)
				.color(1, 0.5, 0, 1)
				.mixColor(1, 1, 0, 1)
				.triangle();

			// add a puff of smoke
			direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
			direction = direction.mul(randInRange(0.25, 1)).sub(this.velocity);
			Particle()
				.position(position)
				.velocity(direction)
				.radius(0.05, 0.1)
				.bounces(1)
				.elasticity(0.05, 0.9)
				.decay(0.0005, 0.001)
				.expand(1.2, 1.4)
				.color(0, 0, 0, 0.25)
				.mixColor(0.25, 0.25, 0.25, 0.75)
				.circle()
				.gravity(-0.4, 0);

			this.timeUntilNextParticle += PARTICLE_FREQUENCY;
		}
	}

	reactToWorld() {
		this.isDead = true;
	}

	reactToPlayer(player: Player) {
		this.isDead = true;
		player.isDead = true;
	}

	onDeath() {
		const position = this.getCenter();

		// fire
		for (let i = 0; i < 50; ++i) {
			let direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
			direction = direction.mul(randInRange(0.5, 17));

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
	}

	draw(c: CanvasRenderingContext2D) {
		this.sprites[
			this.target === gameState.playerA ? ROCKET_SPRITE_RED : ROCKET_SPRITE_BLUE
		].draw(c);
	}
}
