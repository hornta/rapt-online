import { lineOfSightWorld } from "../collision/lineOfSight";
import { ENEMY_MULTI_GUN } from "../constants";
import { gameState } from "../game";
import { Vector } from "../vector";
import { Laser } from "./laser";
import { SpawningEnemy } from "./spawningEntity";

const MULTI_GUN_WIDTH = 0.5;
const MULTI_GUN_HEIGHT = 0.5;
const MULTI_GUN_SHOOT_FREQ = 1.25;
const MULTI_GUN_RANGE = 8;

export class MultiGun extends SpawningEnemy {
	redGun: Vector | null;
	blueGun: Vector | null;
	gunFired: [boolean, boolean, boolean, boolean];
	gunPositions: [Vector, Vector, Vector, Vector];

	constructor(center: Vector) {
		super(
			ENEMY_MULTI_GUN,
			center,
			MULTI_GUN_WIDTH,
			MULTI_GUN_HEIGHT,
			0,
			MULTI_GUN_SHOOT_FREQ,
			0
		);

		this.redGun = null;
		this.blueGun = null;
		this.gunFired = [false, false, false, false];
		this.gunPositions = [
			new Vector(0, 0),
			new Vector(0, 0),
			new Vector(0, 0),
			new Vector(0, 0),
		];

		const pos = this.getCenter();
		this.redGun = new Vector(pos.x, pos.y);
		this.blueGun = new Vector(pos.x, pos.y);
		this.gunPositions[0] = this.hitBox.lowerLeft;
		this.gunPositions[1] = new Vector(
			this.hitBox.getRight(),
			this.hitBox.getBottom()
		);
		this.gunPositions[2] = new Vector(
			this.hitBox.getLeft(),
			this.hitBox.getTop()
		);
		this.gunPositions[3] = this.hitBox.lowerLeft.add(
			new Vector(this.hitBox.getWidth(), this.hitBox.getHeight())
		);
	}

	override canCollide() {
		return false;
	}

	vectorToIndex(v: Vector) {
		const indexX = v.x < 0 ? 0 : 1;
		const indexY = v.y < 0 ? 0 : 2;
		return indexX + indexY;
	}

	spawn() {
		for (let i = 0; i < 4; ++i) {
			this.gunFired[i] = false;
		}

		let fired = false;
		for (let i = 0; i < 2; ++i) {
			const target = gameState.getPlayer(i);
			const index = this.vectorToIndex(
				target.getCenter().sub(this.getCenter())
			);
			const relPosition = target.getCenter().sub(this.gunPositions[index]);
			// Player must be alive and in range to be shot
			if (
				!target.isDead &&
				relPosition.lengthSquared() < MULTI_GUN_RANGE * MULTI_GUN_RANGE &&
				!lineOfSightWorld(
					this.gunPositions[index],
					target.getCenter(),
					gameState.world
				)
			) {
				if (!this.gunFired[index]) {
					gameState.addEnemy(
						new Laser(this.gunPositions[index], relPosition.atan2()),
						this.gunPositions[index]
					);
					this.gunFired[index] = true;
					fired = true;
				}
			}
		}
		return fired;
	}

	override afterTick(seconds: number) {
		const position = this.getCenter();
		const redGunTarget =
			this.gunPositions[
				this.vectorToIndex(gameState.playerA.getCenter().sub(position))
			];
		const blueGunTarget =
			this.gunPositions[
				this.vectorToIndex(gameState.playerB.getCenter().sub(position))
			];

		const speed = 4 * seconds;
		this.redGun!.adjustTowardsTarget(redGunTarget, speed);
		this.blueGun!.adjustTowardsTarget(blueGunTarget, speed);

		//bodySprite.SetOffsetBeforeRotation(position.x, position.y);
	}

	draw(c: CanvasRenderingContext2D) {
		// Draw the red and/or blue circles
		if (
			this.redGun!.eq(this.blueGun!) &&
			!gameState.playerA.isDead &&
			!gameState.playerB.isDead
		) {
			const angle = this.redGun!.sub(this.getCenter()).atan2();
			c.fillStyle = "rgb(205, 0, 0)";
			c.beginPath();
			c.arc(this.redGun!.x, this.redGun!.y, 0.1, angle, angle + Math.PI, false);
			c.fill();
			c.fillStyle = "rgb(0, 0, 255)";
			c.beginPath();
			c.arc(
				this.blueGun!.x,
				this.blueGun!.y,
				0.1,
				angle + Math.PI,
				angle + 2 * Math.PI,
				false
			);
			c.fill();
		} else {
			if (!gameState.playerA.isDead) {
				c.fillStyle = "rgb(205, 0, 0)";
				c.beginPath();
				c.arc(this.redGun!.x, this.redGun!.y, 0.1, 0, 2 * Math.PI, false);
				c.fill();
			}
			if (!gameState.playerB.isDead) {
				c.fillStyle = "rgb(0, 0, 255)";
				c.beginPath();
				c.arc(this.blueGun!.x, this.blueGun!.y, 0.1, 0, 2 * Math.PI, false);
				c.fill();
			}
		}

		// Draw the body
		c.strokeStyle = "black";
		c.beginPath();
		// Bottom horizontal
		c.moveTo(this.gunPositions[0].x, this.gunPositions[0].y + 0.1);
		c.lineTo(this.gunPositions[1].x, this.gunPositions[1].y + 0.1);
		c.moveTo(this.gunPositions[0].x, this.gunPositions[0].y - 0.1);
		c.lineTo(this.gunPositions[1].x, this.gunPositions[1].y - 0.1);
		// Top horizontal
		c.moveTo(this.gunPositions[2].x, this.gunPositions[2].y - 0.1);
		c.lineTo(this.gunPositions[3].x, this.gunPositions[3].y - 0.1);
		c.moveTo(this.gunPositions[2].x, this.gunPositions[2].y + 0.1);
		c.lineTo(this.gunPositions[3].x, this.gunPositions[3].y + 0.1);
		// Left vertical
		c.moveTo(this.gunPositions[0].x + 0.1, this.gunPositions[0].y);
		c.lineTo(this.gunPositions[2].x + 0.1, this.gunPositions[2].y);
		c.moveTo(this.gunPositions[0].x - 0.1, this.gunPositions[0].y);
		c.lineTo(this.gunPositions[2].x - 0.1, this.gunPositions[2].y);
		// Right vertical
		c.moveTo(this.gunPositions[1].x - 0.1, this.gunPositions[1].y);
		c.lineTo(this.gunPositions[3].x - 0.1, this.gunPositions[3].y);
		c.moveTo(this.gunPositions[1].x + 0.1, this.gunPositions[1].y);
		c.lineTo(this.gunPositions[3].x + 0.1, this.gunPositions[3].y);
		c.stroke();

		// Draw the gun holders
		c.beginPath();
		c.arc(
			this.gunPositions[0].x,
			this.gunPositions[0].y,
			0.1,
			0,
			2 * Math.PI,
			false
		);
		c.stroke();
		c.beginPath();
		c.arc(
			this.gunPositions[1].x,
			this.gunPositions[1].y,
			0.1,
			0,
			2 * Math.PI,
			false
		);
		c.stroke();
		c.beginPath();
		c.arc(
			this.gunPositions[2].x,
			this.gunPositions[2].y,
			0.1,
			0,
			2 * Math.PI,
			false
		);
		c.stroke();
		c.beginPath();
		c.arc(
			this.gunPositions[3].x,
			this.gunPositions[3].y,
			0.1,
			0,
			2 * Math.PI,
			false
		);
		c.stroke();
	}

	override reactToWorld() {}
}
