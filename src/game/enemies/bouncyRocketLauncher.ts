import { lineOfSightWorld } from "../collisionDetection";
import { ENEMY_BOUNCY_ROCKET_LAUNCHER } from "../constants";
import { gameState } from "../game";
import { Player } from "../player";
import { Sprite } from "../sprite";
import { Vector } from "../vector";
import { BouncyRocket } from "./bouncyRocket";
import { SpawningEnemy } from "./spawningEntity";

const BOUNCY_LAUNCHER_WIDTH = 0.5;
const BOUNCY_LAUNCHER_HEIGHT = 0.5;
const BOUNCY_LAUNCHER_SHOOT_FREQ = 1;
const BOUNCY_LAUNCHER_RANGE = 8;

export class BouncyRocketLauncher extends SpawningEnemy {
	target: Player;
	canFire: boolean;
	angle: number;
	bodySprite: Sprite;

	constructor(center: Vector, target: Player) {
		super(
			ENEMY_BOUNCY_ROCKET_LAUNCHER,
			center,
			BOUNCY_LAUNCHER_WIDTH,
			BOUNCY_LAUNCHER_HEIGHT,
			0,
			BOUNCY_LAUNCHER_SHOOT_FREQ,
			0
		);
		this.target = target;
		this.canFire = true;
		this.angle = 0;

		this.bodySprite = new Sprite(
			this.target === gameState.playerA
				? (c) => {
						// End of gun
						c.strokeStyle = "black";
						c.beginPath();
						c.moveTo(0, -0.1);
						c.lineTo(-0.3, -0.1);
						c.lineTo(-0.3, 0.1);
						c.lineTo(0, 0 + 0.1);
						c.stroke();

						// Main body
						c.fillStyle = "red";
						c.beginPath();
						c.arc(0, 0, 0.2, 0, 2 * Math.PI, false);
						c.fill();
						c.fillStyle = "blue";
						c.beginPath();
						c.arc(0, 0, 0.2, 1.65 * Math.PI, 2.35 * Math.PI, false);
						c.fill();

						c.strokeStyle = "black";
						c.beginPath();
						c.arc(0, 0, 0.2, 0, 2 * Math.PI, false);
						c.stroke();

						c.beginPath();
						c.moveTo(0.1, -0.18);
						c.lineTo(0.1, 0.18);
						c.stroke();
				  }
				: (c) => {
						// End of gun
						c.strokeStyle = "black";
						c.beginPath();
						c.moveTo(0, -0.1);
						c.lineTo(-0.3, -0.1);
						c.lineTo(-0.3, 0.1);
						c.lineTo(0, 0 + 0.1);
						c.stroke();

						// Main body
						c.fillStyle = "blue";
						c.beginPath();
						c.arc(0, 0, 0.2, 0, 2 * Math.PI, false);
						c.fill();
						c.fillStyle = "red";
						c.beginPath();
						c.arc(0, 0, 0.2, 1.65 * Math.PI, 2.35 * Math.PI, false);
						c.fill();

						c.strokeStyle = "black";
						c.beginPath();
						c.arc(0, 0, 0.2, 0, 2 * Math.PI, false);
						c.stroke();

						c.fillStyle = "black";
						c.beginPath();
						c.moveTo(0.1, -0.18);
						c.lineTo(0.1, 0.18);
						c.stroke();
				  }
		);
	}

	setTarget(player: Player) {
		this.target = player;
	}

	canCollide() {
		return false;
	}

	rocketDestroyed() {
		this.canFire = true;
	}

	getTarget() {
		return Number(this.target === gameState.playerB);
	}

	reactToWorld(): void {}

	move(): Vector {
		return new Vector(0, 0);
	}

	spawn() {
		if (this.canFire && !this.target.isDead) {
			const targetDelta = this.target.getCenter().sub(this.getCenter());
			// If Player is out of range or out of line of sight, don't launch anything
			if (targetDelta.length() < BOUNCY_LAUNCHER_RANGE) {
				if (
					!lineOfSightWorld(
						this.getCenter(),
						this.target.getCenter(),
						gameState.world
					)
				) {
					gameState.addEnemy(
						new BouncyRocket(
							this.getCenter(),
							this.target,
							targetDelta.atan2(),
							this
						),
						this.getCenter()
					);
					this.canFire = false;
					return true;
				}
			}
		}
		return false;
	}

	afterTick() {
		const position = this.getCenter();
		if (!this.target.isDead) {
			this.bodySprite.angle = position.sub(this.target.getCenter()).atan2();
		}
		this.bodySprite.offsetBeforeRotation = position;
	}

	draw(c: CanvasRenderingContext2D) {
		this.bodySprite.draw(c);
	}
}
