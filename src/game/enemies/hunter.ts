import { lineOfSightWorld } from "../collision/lineOfSight";
import { ENEMY_HUNTER } from "../constants";
import { gameState } from "../game";
import { Player } from "../player";
import { Sprite } from "../sprite";
import { adjustAngleToTarget } from "../utils";
import { Vector } from "../vector";
import { RotatingEnemy } from "./rotatingEnemy";

const HUNTER_BODY = 0;
const HUNTER_CLAW1 = 1;
const HUNTER_CLAW2 = 2;

const HUNTER_RADIUS = 0.3;
const HUNTER_ELASTICITY = 0.4;
const HUNTER_CHASE_ACCEL = 14;
const HUNTER_FLEE_ACCEL = 3;
const HUNTER_CHASE_RANGE = 8;
const HUNTER_LOOKAHEAD = 20;

const STATE_IDLE = 0;
const STATE_RED = 1;
const STATE_BLUE = 2;
const STATE_BOTH = 3;

export class Hunter extends RotatingEnemy {
	state: 0 | 1 | 2 | 3;
	acceleration: Vector;
	jawAngle: number;
	sprites: [Sprite, Sprite, Sprite];
	target: Player | null;

	constructor(center: Vector) {
		super(ENEMY_HUNTER, center, HUNTER_RADIUS, 0, HUNTER_ELASTICITY);

		this.state = STATE_IDLE;
		this.acceleration = new Vector(0, 0);
		this.jawAngle = 0;

		const drawClaw: Sprite["drawGeometry"] = (c) => {
			c.beginPath();
			c.moveTo(0, 0.1);
			for (let i = 0; i <= 6; i++) {
				c.lineTo((i & 1) / 24, 0.2 + i * 0.05);
			}
			c.arc(0, 0.2, 0.3, 0.5 * Math.PI, -0.5 * Math.PI, true);
			c.stroke();
		};

		this.sprites = [
			new Sprite((c) => {
				c.beginPath();
				c.arc(0, 0, 0.1, 0, 2 * Math.PI, false);
				c.stroke();
			}),
			new Sprite(drawClaw),
			new Sprite(drawClaw),
		];
		this.sprites[HUNTER_CLAW1].setParent(this.sprites[HUNTER_BODY]);
		this.sprites[HUNTER_CLAW2].setParent(this.sprites[HUNTER_BODY]);
		this.sprites[HUNTER_CLAW2].flip = true;
		this.sprites[HUNTER_BODY].offsetAfterRotation = new Vector(0, -0.2);
	}

	override avoidsSpawn() {
		return true;
	}

	calcAcceleration(target: Vector) {
		return target
			.unit()
			.sub(this.velocity.mul(3.0 / HUNTER_CHASE_ACCEL))
			.unit()
			.mul(HUNTER_CHASE_ACCEL);
	}

	playerInSight(target: Player, distanceSquared: number) {
		if (target.isDead) {
			return false;
		}
		let inSight = distanceSquared < HUNTER_CHASE_RANGE * HUNTER_CHASE_RANGE;
		inSight &&= !lineOfSightWorld(
			this.getCenter(),
			target.getCenter(),
			gameState.world
		);
		return inSight;
	}

	override move(seconds: number) {
		// Relative player positions
		const deltaA = gameState.playerA.getCenter().sub(this.getCenter());
		const deltaB = gameState.playerB.getCenter().sub(this.getCenter());
		// Projection positions with lookahead
		const projectedA = deltaA.add(
			gameState.playerA.getVelocity().mul(HUNTER_LOOKAHEAD * seconds)
		);
		const projectedB = deltaB.add(
			gameState.playerB.getVelocity().mul(HUNTER_LOOKAHEAD * seconds)
		);
		// Squared distances
		const distASquared = deltaA.lengthSquared();
		const distBSquared = deltaB.lengthSquared();
		// Checks if players are in sight
		const inSightA = this.playerInSight(gameState.playerA, distASquared);
		const inSightB = this.playerInSight(gameState.playerB, distBSquared);

		// If player A is in sight
		if (inSightA) {
			// If both in sight
			if (inSightB) {
				// If they're on the same side of the Hunter, the Hunter will flee
				if (deltaA.dot(this.velocity) * deltaB.dot(this.velocity) >= 0) {
					this.acceleration = deltaA
						.unit()
						.add(deltaB.unit())
						.mul(-0.5 * HUNTER_FLEE_ACCEL);
					this.target = null;
					this.state = STATE_BOTH;
				} else if (distASquared < distBSquared) {
					// Otherwise the hunter will chase after the closer of the two players
					this.acceleration = this.calcAcceleration(projectedA);
					this.target = gameState.playerA;
					this.state = STATE_RED;
				} else {
					this.acceleration = this.calcAcceleration(projectedB);
					this.target = gameState.playerB;
					this.state = STATE_BLUE;
				}
				// If only player A in sight
			} else {
				this.acceleration = this.calcAcceleration(projectedA);
				this.target = gameState.playerA;
				this.state = STATE_RED;
			}
		} else if (inSightB) {
			// If only player B in sight
			this.acceleration = this.calcAcceleration(projectedB);
			this.target = gameState.playerB;
			this.state = STATE_BLUE;
		} else {
			this.acceleration.x = this.acceleration.y = 0;
			this.target = null;
			this.state = STATE_IDLE;
		}

		// Damp the movement so it doesn't keep floating around
		// Time independent version of multiplying by 0.99
		this.velocity.inplaceMul(Math.pow(0.366032, seconds));

		return this.accelerate(this.acceleration, seconds);
	}

	override afterTick(seconds: number) {
		const position = this.getCenter();
		this.sprites[HUNTER_BODY].offsetBeforeRotation = position;

		if (this.target) {
			const currentAngle = this.sprites[HUNTER_BODY].angle;
			const targetAngle =
				this.target.getCenter().sub(position).atan2() - Math.PI / 2;
			this.sprites[HUNTER_BODY].angle = adjustAngleToTarget(
				currentAngle,
				targetAngle,
				Math.PI * seconds
			);
		}

		const targetJawAngle = this.target ? -0.2 : 0;
		this.jawAngle = adjustAngleToTarget(
			this.jawAngle,
			targetJawAngle,
			0.4 * seconds
		);
		this.sprites[HUNTER_CLAW1].angle = this.jawAngle;
		this.sprites[HUNTER_CLAW2].angle = this.jawAngle;
	}

	draw(c: CanvasRenderingContext2D) {
		c.fillStyle = this.target === gameState.playerA ? "red" : "blue";
		c.strokeStyle = "black";

		if (this.state !== STATE_IDLE) {
			const angle = this.sprites[HUNTER_BODY].angle + Math.PI / 2;
			const fromEye = Vector.fromAngle(angle);
			const eye = this.getCenter().sub(fromEye.mul(0.2));

			if (this.state === STATE_RED) {
				c.fillStyle = "red";
				c.beginPath();
				c.arc(eye.x, eye.y, 0.1, 0, 2 * Math.PI, false);
				c.fill();
			} else if (this.state === STATE_BLUE) {
				c.fillStyle = "blue";
				c.beginPath();
				c.arc(eye.x, eye.y, 0.1, 0, 2 * Math.PI, false);
				c.fill();
			} else {
				c.fillStyle = "red";
				c.beginPath();
				c.arc(eye.x, eye.y, 0.1, angle, angle + Math.PI, false);
				c.fill();

				c.fillStyle = "blue";
				c.beginPath();
				c.arc(eye.x, eye.y, 0.1, angle + Math.PI, angle + 2 * Math.PI, false);
				c.fill();

				c.beginPath();
				c.moveTo(eye.x - fromEye.x * 0.1, eye.y - fromEye.y * 0.1);
				c.lineTo(eye.x + fromEye.x * 0.1, eye.y + fromEye.y * 0.1);
				c.stroke();
			}
		}

		this.sprites[HUNTER_BODY].draw(c);
	}

	override reactToWorld() {}
}
