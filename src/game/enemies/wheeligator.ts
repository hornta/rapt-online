import { ENEMY_WHEELIGATOR, EDGE_FLOOR } from "../constants";
import { Contact } from "../contact";
import { Edge } from "../edge";
import { Sprite } from "../sprite";
import { Vector } from "../vector";
import { FREEFALL_ACCEL } from "./freefallEnemy";
import { WalkingEnemy } from "./walkingEnemy";

const WHEELIGATOR_RADIUS = 0.3;
const WHEELIGATOR_SPEED = 3;
const WHEELIGATOR_ELASTICITY = 1;
const WHEELIGATOR_FLOOR_ELASTICITY = 0.3;

export class Wheeligator extends WalkingEnemy {
	hitGround: boolean;
	angularVelocity: number;
	startsRight: boolean;
	bodySprite: Sprite;
	constructor(center: Vector, angle: number) {
		super(
			ENEMY_WHEELIGATOR,
			center,
			WHEELIGATOR_RADIUS,
			WHEELIGATOR_ELASTICITY
		);

		this.hitGround = false;
		this.angularVelocity = 0;
		this.startsRight = Math.cos(angle) > 0;

		this.bodySprite = new Sprite((c) => {
			const rim = 0.1;

			c.strokeStyle = "black";
			c.beginPath();
			c.arc(0, 0, WHEELIGATOR_RADIUS, 0, 2 * Math.PI, false);
			c.arc(0, 0, WHEELIGATOR_RADIUS - rim, Math.PI, 3 * Math.PI, false);
			c.stroke();

			c.fillStyle = "black";
			for (let i = 0; i < 4; i++) {
				const startAngle = i * ((2 * Math.PI) / 4);
				const endAngle = startAngle + Math.PI / 4;
				c.beginPath();
				c.arc(0, 0, WHEELIGATOR_RADIUS, startAngle, endAngle, false);
				c.arc(0, 0, WHEELIGATOR_RADIUS - rim, endAngle, startAngle, true);
				c.fill();
			}
		});
	}

	override move(seconds: number) {
		const isOnFloor = this.isOnFloor();

		if (!this.hitGround && isOnFloor) {
			if (this.velocity.x < WHEELIGATOR_SPEED) {
				this.velocity.x = this.startsRight
					? WHEELIGATOR_SPEED
					: -WHEELIGATOR_SPEED;
				this.hitGround = true;
			}
		}

		if (isOnFloor) {
			this.angularVelocity = -this.velocity.x / WHEELIGATOR_RADIUS;
		}

		this.velocity.y += FREEFALL_ACCEL * seconds;
		return this.velocity.mul(seconds);
	}

	override reactToWorld(contact: Contact) {
		// If a floor, bounce off like elasticity is FLOOR_ELASTICITY
		if (Edge.getOrientation(contact.normal) === EDGE_FLOOR) {
			const perpendicular = this.velocity.projectOntoAUnitVector(
				contact.normal
			);
			const parallel = this.velocity.sub(perpendicular);
			this.velocity = parallel.add(
				perpendicular.mul(WHEELIGATOR_FLOOR_ELASTICITY)
			);
			this.angularVelocity = -this.velocity.x / WHEELIGATOR_RADIUS;
		}
	}

	override afterTick(seconds: number) {
		this.bodySprite.offsetBeforeRotation = this.getCenter();
		this.bodySprite.angle =
			this.bodySprite.angle + this.angularVelocity * seconds;
	}

	draw(c: CanvasRenderingContext2D) {
		this.bodySprite.draw(c);
	}
}
