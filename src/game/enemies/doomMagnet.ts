import { ENEMY_MAGNET } from "../constants";
import { gameState } from "../game";
import { Player } from "../player";
import { Sprite } from "../sprite";
import { adjustAngleToTarget } from "../utils";
import { Vector } from "../vector";
import { RotatingEnemy } from "./rotatingEnemy";

const DOOM_MAGNET_RADIUS = 0.3;
const DOOM_MAGNET_ELASTICITY = 0.5;
const DOOM_MAGNET_RANGE = 10;
const DOOM_MAGNET_ACCEL = 2;
const MAGNET_MAX_ROTATION = 2 * Math.PI;

export class DoomMagnet extends RotatingEnemy {
	bodySprite: Sprite;

	constructor(center: Vector) {
		super(ENEMY_MAGNET, center, DOOM_MAGNET_RADIUS, 0, DOOM_MAGNET_ELASTICITY);

		this.bodySprite = new Sprite((c) => {
			const length = 0.15;
			const outerRadius = 0.15;
			const innerRadius = 0.05;

			for (let scale = -1; scale <= 1; scale += 2) {
				c.fillStyle = "red";
				c.beginPath();
				c.moveTo(-outerRadius - length, scale * innerRadius);
				c.lineTo(-outerRadius - length, scale * outerRadius);
				c.lineTo(
					-outerRadius - length + (outerRadius - innerRadius),
					scale * outerRadius
				);
				c.lineTo(
					-outerRadius - length + (outerRadius - innerRadius),
					scale * innerRadius
				);
				c.fill();

				c.fillStyle = "blue";
				c.beginPath();
				c.moveTo(outerRadius + length, scale * innerRadius);
				c.lineTo(outerRadius + length, scale * outerRadius);
				c.lineTo(
					outerRadius + length - (outerRadius - innerRadius),
					scale * outerRadius
				);
				c.lineTo(
					outerRadius + length - (outerRadius - innerRadius),
					scale * innerRadius
				);
				c.fill();
			}
			c.strokeStyle = "black";

			// draw one prong of the magnet
			c.beginPath();
			c.arc(outerRadius, 0, outerRadius, 1.5 * Math.PI, 0.5 * Math.PI, true);
			c.lineTo(outerRadius + length, outerRadius);
			c.lineTo(outerRadius + length, innerRadius);

			c.arc(outerRadius, 0, innerRadius, 0.5 * Math.PI, 1.5 * Math.PI, false);
			c.lineTo(outerRadius + length, -innerRadius);
			c.lineTo(outerRadius + length, -outerRadius);
			c.lineTo(outerRadius, -outerRadius);
			c.stroke();

			// other prong
			c.beginPath();
			c.arc(-outerRadius, 0, outerRadius, 1.5 * Math.PI, 2.5 * Math.PI, false);
			c.lineTo(-outerRadius - length, outerRadius);
			c.lineTo(-outerRadius - length, innerRadius);

			c.arc(-outerRadius, 0, innerRadius, 2.5 * Math.PI, 1.5 * Math.PI, true);
			c.lineTo(-outerRadius - length, -innerRadius);
			c.lineTo(-outerRadius - length, -outerRadius);
			c.lineTo(-outerRadius, -outerRadius);
			c.stroke();
		});
	}

	override avoidsSpawn() {
		return true;
	}

	calcHeadingVector(target: Player) {
		if (target.isDead) {
			return new Vector(0, 0);
		}
		const delta = target.getCenter().sub(this.getCenter());
		if (delta.lengthSquared() > DOOM_MAGNET_RANGE * DOOM_MAGNET_RANGE) {
			return new Vector(0, 0);
		}
		delta.normalize();
		return delta;
	}

	override move(seconds: number) {
		const playerA = gameState.playerA;
		const playerB = gameState.playerB;

		const headingA = this.calcHeadingVector(playerA);
		const headingB = this.calcHeadingVector(playerB);
		const heading = headingA.add(headingB).mul(DOOM_MAGNET_ACCEL);

		const delta = this.accelerate(heading, seconds);
		// Time independent version of mulitiplying by 0.994
		this.velocity.inplaceMul(Math.pow(0.547821, seconds));

		const center = this.getCenter();
		const oldAngle = this.bodySprite.angle;
		let targetAngle = oldAngle;
		if (!playerA.isDead && playerB.isDead) {
			targetAngle = playerA.getCenter().sub(center).atan2() + Math.PI;
		} else if (playerA.isDead && !playerB.isDead) {
			targetAngle = playerB.getCenter().sub(center).atan2();
		} else if (!playerA.isDead && !playerB.isDead) {
			const needsFlip =
				playerA
					.getCenter()
					.sub(center)
					.flip()
					.dot(playerB.getCenter().sub(center)) < 0;
			targetAngle =
				heading.atan2() - Math.PI * 0.5 + Math.PI * (needsFlip ? 1 : 0);
		}
		this.bodySprite.angle = adjustAngleToTarget(
			oldAngle,
			targetAngle,
			MAGNET_MAX_ROTATION * seconds
		);

		return delta;
	}

	override afterTick() {
		const position = this.getCenter();
		this.bodySprite.offsetBeforeRotation = new Vector(position.x, position.y);
	}

	draw(c: CanvasRenderingContext2D) {
		this.bodySprite.draw(c);
	}
}
