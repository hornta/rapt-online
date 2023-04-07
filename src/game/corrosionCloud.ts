import { ENEMY_CLOUD } from "./constants.js";
import { RotatingEnemy } from "./enemies/rotatingEnemy.js";
import { gameState } from "./game.js";
import { randInRange } from "./math.js";
import { Particle } from "./particle.js";
import { Player } from "./player.js";
import { adjustAngleToTarget } from "./utils.js";
import { Vector } from "./vector.js";

const CORROSION_CLOUD_RADIUS = 0.5;
const CORROSION_CLOUD_SPEED = 0.7;
const CORROSION_CLOUD_ACCEL = 10;

export class CorrosionCloud extends RotatingEnemy {
	target: Player;
	smoothedVelocity: Vector;

	constructor(center: Vector, target: Player) {
		super(ENEMY_CLOUD, center, CORROSION_CLOUD_RADIUS, 0, 0);

		this.target = target;
		this.smoothedVelocity = new Vector(0, 0);
	}

	canCollide() {
		return false;
	}

	avoidsSpawn() {
		return true;
	}

	move(seconds: number) {
		if (!this.target) {
			return new Vector(0, 0);
		}
		const targetDelta = this.target.getCenter().sub(this.getCenter());
		// As long as the max rotation is over 2 pi, it will rotate to face the player no matter what
		this.heading = adjustAngleToTarget(this.heading, targetDelta.atan2(), 7);
		// ACCELERATION
		const speed = CORROSION_CLOUD_SPEED * CORROSION_CLOUD_ACCEL * seconds;
		this.velocity.x += speed * Math.cos(this.heading);
		this.velocity.y += speed * Math.sin(this.heading);

		if (
			this.velocity.lengthSquared() >
			CORROSION_CLOUD_SPEED * CORROSION_CLOUD_SPEED
		) {
			this.velocity.normalize();
			this.velocity.inplaceMul(CORROSION_CLOUD_SPEED);
		}

		return this.velocity.mul(seconds);
	}

	afterTick() {
		const direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
		const center = this.getCenter().add(
			direction.mul(randInRange(0, CORROSION_CLOUD_RADIUS))
		);

		const isRed = this.target === gameState.playerA ? 0.4 : 0;
		const isBlue = this.target === gameState.playerB ? 0.3 : 0;

		this.smoothedVelocity = this.smoothedVelocity
			.mul(0.95)
			.add(this.velocity.mul(0.05));
		Particle()
			.position(center)
			.velocity(
				this.smoothedVelocity.sub(new Vector(0.1, 0.1)),
				this.smoothedVelocity.add(new Vector(0.1, 0.1))
			)
			.radius(0.01, 0.1)
			.bounces(0, 4)
			.elasticity(0.05, 0.9)
			.decay(0.01, 0.5)
			.expand(1, 1.2)
			.color(0.2 + isRed, 0.2, 0.2 + isBlue, 1)
			.mixColor(0.1 + isRed, 0.1, 0.1 + isBlue, 1)
			.circle()
			.gravity(-0.4, 0);
	}

	getTarget() {
		return Number(this.target === gameState.playerB);
	}

	draw() {}
}
