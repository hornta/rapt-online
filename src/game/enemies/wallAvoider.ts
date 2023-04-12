import { closestToEntityWorld } from "../collisionDetection";
import { ENEMY_WALL_AVOIDER, STAT_ENEMY_DEATHS } from "../constants";
import { gameState } from "../game";
import { randInRange } from "../math";
import { Particle } from "../particle";
import { Player } from "../player";
import { Sprite } from "../sprite";
import { Vector } from "../vector";
import { RotatingEnemy } from "./rotatingEnemy";

const WALL_AVOIDER_RADIUS = 0.3;
const WALL_AVOIDER_ACCEL = 3.3;

export class WallAvoider extends RotatingEnemy {
	target: Player;
	acceleration: Vector;
	angularVelocity: number;
	bodySprite: Sprite;
	velocity = new Vector(0, 0);

	constructor(center: Vector, target: Player) {
		super(ENEMY_WALL_AVOIDER, center, WALL_AVOIDER_RADIUS, 0, 0);

		this.target = target;
		this.acceleration = new Vector(0, 0);
		this.angularVelocity = 0;

		this.bodySprite = new Sprite((c) => {
			c.beginPath();
			c.arc(0, 0, 0.1, 0, 2 * Math.PI, false);
			c.fill();
			c.stroke();
			c.beginPath();
			for (let i = 0; i < 4; i++) {
				const angle = i * ((2 * Math.PI) / 4);
				const cos = Math.cos(angle);
				const sin = Math.sin(angle);
				c.moveTo(cos * 0.1, sin * 0.1);
				c.lineTo(cos * 0.3, sin * 0.3);
				c.moveTo(cos * 0.16 - sin * 0.1, sin * 0.16 + cos * 0.1);
				c.lineTo(cos * 0.16 + sin * 0.1, sin * 0.16 - cos * 0.1);
				c.moveTo(cos * 0.23 - sin * 0.05, sin * 0.23 + cos * 0.05);
				c.lineTo(cos * 0.23 + sin * 0.05, sin * 0.23 - cos * 0.05);
			}
			c.stroke();
		});
	}

	move(seconds: number) {
		if (this.target.isDead) {
			this.velocity.x = this.velocity.y = 0;
			return this.velocity.mul(seconds);
		} else {
			const targetDelta = this.target.getCenter().sub(this.getCenter());
			const ref_shapePoint: { ref: Vector } = {} as { ref: Vector };
			const ref_worldPoint: { ref: Vector } = {} as { ref: Vector };
			const closestPointDist = closestToEntityWorld(
				this,
				5,
				ref_shapePoint,
				ref_worldPoint,
				gameState.world
			);
			// If something went horribly, horribly wrong
			if (closestPointDist < 0.001) {
				return this.accelerate(new Vector(0, 0), seconds);
			}
			this.acceleration = targetDelta.unit();
			if (closestPointDist < Number.POSITIVE_INFINITY) {
				const closestPointDelta = ref_worldPoint.ref.sub(this.getCenter());
				const wallAvoidance = closestPointDelta.mul(
					-1 / (closestPointDist * closestPointDist)
				);
				this.acceleration.inplaceAdd(wallAvoidance);
			}
			this.acceleration.normalize();
			this.acceleration.inplaceMul(WALL_AVOIDER_ACCEL);

			// Time independent version of multiplying by 0.99
			this.velocity.inplaceMul(Math.pow(0.366032, seconds));
			return this.accelerate(this.acceleration, seconds);
		}
	}

	reactToWorld() {
		this.isDead = true;
	}

	onDeath() {
		gameState.incrementStat(STAT_ENEMY_DEATHS);

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
				.decay(0.000001, 0.00001)
				.expand(1.0, 1.2)
				.color(1, 0.3, 0, 1)
				.mixColor(1, 0.1, 0, 1)
				.triangle();
		}
	}

	afterTick(seconds: number) {
		this.bodySprite.offsetBeforeRotation = this.getCenter();
		this.angularVelocity =
			(this.angularVelocity + randInRange(-Math.PI, Math.PI)) * 0.5;
		this.bodySprite.angle += this.angularVelocity * seconds;
	}

	draw(c: CanvasRenderingContext2D) {
		c.fillStyle = this.target === gameState.playerA ? "red" : "blue";
		c.strokeStyle = "black";
		this.bodySprite.draw(c);
	}
}
