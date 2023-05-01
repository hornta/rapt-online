import { ENEMY_RIOT_BULLET } from "../constants";
import { Enemy } from "../enemy";
import { randInRange } from "../math";
import { Particle } from "../particle";
import { Player } from "../player";
import { Vector } from "../vector";
import { FreefallEnemy } from "./freefallEnemy";

const RIOT_BULLET_RADIUS = 0.1;
const RIOT_BULLET_SPEED = 7;

export class RiotBullet extends FreefallEnemy {
	constructor(center: Vector, direction: number) {
		super(ENEMY_RIOT_BULLET, center, RIOT_BULLET_RADIUS, 0);
		this.velocity = new Vector(
			RIOT_BULLET_SPEED * Math.cos(direction),
			RIOT_BULLET_SPEED * Math.sin(direction)
		);
	}

	override reactToPlayer(player: Player) {
		if (!this.isDead) {
			// the delta-velocity applied to the player
			const deltaVelocity = this.velocity.mul(0.75);
			player.addToVelocity(deltaVelocity);
		}
		this.isDead = true;
	}

	override onDeath() {
		const position = this.getCenter();

		// smoke
		for (let i = 0; i < 5; ++i) {
			let direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
			direction = this.velocity.add(direction.mul(randInRange(0.1, 1)));

			Particle()
				.position(position)
				.velocity(direction)
				.radius(0.01, 0.1)
				.bounces(0, 4)
				.elasticity(0.05, 0.9)
				.decay(0.0005, 0.005)
				.expand(1.0, 1.2)
				.color(0.9, 0.9, 0, 1)
				.mixColor(1, 1, 0, 1)
				.circle();
		}
		Enemy.prototype.onDeath.call(this);
	}

	override draw(c: CanvasRenderingContext2D) {
		const pos = this.getCenter();
		c.strokeStyle = "black";
		c.fillStyle = "yellow";
		c.beginPath();
		c.arc(pos.x, pos.y, RIOT_BULLET_RADIUS, 0, 2 * Math.PI, false);
		c.fill();
		c.stroke();
	}
}
