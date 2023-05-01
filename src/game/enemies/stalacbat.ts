import { lineOfSightWorld } from "../collision/lineOfSight";
import { ENEMY_STALACBAT, STAT_ENEMY_DEATHS } from "../constants";
import { gameState } from "../game";
import { randInRange } from "../math";
import { Particle } from "../particle";
import { Player } from "../player";
import { Sprite } from "../sprite";
import { Vector } from "../vector";
import { FreefallEnemy } from "./freefallEnemy";

const STALACBAT_RADIUS = 0.2;
const STALACBAT_SPEED = 2;
const STALACBAT_SPRITE_BODY = 0;
const STALACBAT_SPRITE_LEFT_WING = 1;
const STALACBAT_SPRITE_RIGHT_WING = 2;

export class Stalacbat extends FreefallEnemy {
	target: Player;
	isFalling: boolean;
	sprites: Sprite[];

	constructor(center: Vector, target: Player) {
		super(ENEMY_STALACBAT, center, STALACBAT_RADIUS, 0);
		this.target = target;
		this.isFalling = false;

		const drawWing = (c: CanvasRenderingContext2D) => {
			c.strokeStyle = "black";
			c.beginPath();
			c.arc(0, 0, 0.2, 0, Math.PI / 2, false);
			c.arc(0, 0, 0.15, Math.PI / 2, 0, true);
			c.stroke();

			c.beginPath();
			c.moveTo(0.07, 0.07);
			c.lineTo(0.1, 0.1);
			c.stroke();
		};

		this.sprites = [
			new Sprite((c) => {
				c.strokeStyle = "black";
				c.beginPath();
				c.arc(0, 0, 0.1, 0, 2 * Math.PI, false);
				c.stroke();
				c.fill();
			}),
			new Sprite(drawWing),
			new Sprite(drawWing),
		];

		this.sprites[STALACBAT_SPRITE_LEFT_WING].setParent(
			this.sprites[STALACBAT_SPRITE_BODY]
		);
		this.sprites[STALACBAT_SPRITE_RIGHT_WING].setParent(
			this.sprites[STALACBAT_SPRITE_BODY]
		);
	}

	// Falls when the target is directly beneat it
	override move(seconds: number) {
		if (this.isFalling) {
			return FreefallEnemy.prototype.move.call(this, seconds);
		} else if (this.target !== null && !this.target.isDead) {
			const playerPos = this.target.getCenter();
			const pos = this.getCenter();
			if (Math.abs(playerPos.x - pos.x) < 0.1 && playerPos.y < pos.y) {
				if (!lineOfSightWorld(pos, playerPos, gameState.world)) {
					this.isFalling = true;
					return FreefallEnemy.prototype.move.call(this, seconds);
				}
			}
		}
		return new Vector(0, 0);
	}

	override afterTick() {
		let percent = this.velocity.y * -0.25;
		if (percent > 1) {
			percent = 1;
		}

		const position = this.getCenter();
		this.sprites[STALACBAT_SPRITE_BODY].offsetBeforeRotation = new Vector(
			position.x,
			position.y + 0.1 - 0.2 * percent
		);

		const angle = (percent * Math.PI) / 2;
		this.sprites[STALACBAT_SPRITE_LEFT_WING].angle = Math.PI - angle;
		this.sprites[STALACBAT_SPRITE_RIGHT_WING].angle = angle - Math.PI / 2;
	}

	override onDeath() {
		gameState.incrementStat(STAT_ENEMY_DEATHS);

		const isRed = this.target === gameState.playerA ? 0.8 : 0;
		const isBlue = this.target === gameState.playerB ? 1 : 0;

		const position = this.getCenter();
		for (let i = 0; i < 15; ++i) {
			const direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(
				randInRange(5, 10)
			);
			Particle()
				.position(position)
				.velocity(direction)
				.radius(0.2)
				.bounces(3)
				.decay(0.01)
				.elasticity(0.5)
				.color(isRed, 0, isBlue, 1)
				.triangle();
		}
	}

	override draw(c: CanvasRenderingContext2D) {
		// Draw the colored "eye"
		if (this.target === gameState.playerA) {
			c.fillStyle = "red";
		} else {
			c.fillStyle = "blue";
		}

		// Draw the black wings
		this.sprites[STALACBAT_SPRITE_BODY].draw(c);
	}
}
