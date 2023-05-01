import { ENEMY_JET_STREAM } from "../constants";
import { gameState } from "../game";
import { Sprite } from "../sprite";
import { Vector } from "../vector";
import { RiotBullet } from "./riotBullet";
import { SpawningEnemy } from "./spawningEntity";

const JET_STREAM_WIDTH = 0.4;
const JET_STREAM_HEIGHT = 0.4;
const JET_STREAM_SHOOT_FREQ = 0.2;
const NUM_BARRELS = 3;

const JET_STREAM_SPRITE_A = 0;
const JET_STREAM_SPRITE_B = 1;

export class JetStream extends SpawningEnemy {
	direction: number;
	reloadAnimation: number;
	sprites: [Sprite, Sprite];

	constructor(center: Vector, direction: number) {
		super(
			ENEMY_JET_STREAM,
			center,
			JET_STREAM_WIDTH,
			JET_STREAM_HEIGHT,
			0,
			JET_STREAM_SHOOT_FREQ,
			0
		);
		this.direction = direction;
		this.reloadAnimation = 0;

		const drawGeometry: Sprite["drawGeometry"] = (c) => {
			c.strokeStyle = "black";
			c.beginPath();
			for (let i = 0; i < NUM_BARRELS; i++) {
				const angle = i * ((2 * Math.PI) / NUM_BARRELS);
				c.moveTo(0, 0);
				c.lineTo(0.2 * Math.cos(angle), 0.2 * Math.sin(angle));
			}
			c.stroke();
		};

		this.sprites = [new Sprite(drawGeometry), new Sprite(drawGeometry)];
	}

	override canCollide() {
		return false;
	}

	spawn() {
		gameState.addEnemy(
			new RiotBullet(this.getCenter(), this.direction),
			this.getCenter()
		);
		return true;
	}

	override afterTick(seconds: number) {
		this.reloadAnimation += seconds * (0.5 / JET_STREAM_SHOOT_FREQ);

		const angle = this.reloadAnimation * ((2 * Math.PI) / NUM_BARRELS);
		const targetAngle = this.direction - Math.PI / 2;
		const bodyOffset = Vector.fromAngle(targetAngle).mul(0.2);

		const position = this.getCenter();
		this.sprites[JET_STREAM_SPRITE_A].angle = targetAngle + angle;
		this.sprites[JET_STREAM_SPRITE_B].angle = targetAngle - angle;
		this.sprites[JET_STREAM_SPRITE_A].offsetBeforeRotation =
			position.sub(bodyOffset);
		this.sprites[JET_STREAM_SPRITE_B].offsetBeforeRotation =
			position.add(bodyOffset);

		// adjust for even NUM_BARRELS
		if (!(NUM_BARRELS & 1)) {
			this.sprites[JET_STREAM_SPRITE_B].angle += Math.PI / NUM_BARRELS;
		}
	}

	draw(c: CanvasRenderingContext2D) {
		this.sprites[JET_STREAM_SPRITE_A].draw(c);
		this.sprites[JET_STREAM_SPRITE_B].draw(c);

		const angle = this.reloadAnimation * ((2 * Math.PI) / NUM_BARRELS);
		const targetAngle = this.direction - Math.PI / 2;
		const position = this.getCenter();
		const bodyOffset = Vector.fromAngle(targetAngle).mul(0.2);

		c.fillStyle = "yellow";
		c.strokeStyle = "black";

		for (let side = -1; side <= 1; side += 2) {
			for (let i = 0; i < NUM_BARRELS; i++) {
				let theta = i * ((2 * Math.PI) / NUM_BARRELS) - side * angle;
				let reload =
					(this.reloadAnimation - i * side) / NUM_BARRELS +
					Number(side === 1) * 0.5;

				// adjust for even NUM_BARRELS
				if (side === 1 && !(NUM_BARRELS & 1)) {
					theta += Math.PI / NUM_BARRELS;
					reload -= 0.5 / NUM_BARRELS;
				}

				reload -= Math.floor(reload);

				const pos = position
					.add(bodyOffset.mul(side))
					.add(bodyOffset.rotate(theta));
				c.beginPath();
				c.arc(pos.x, pos.y, 0.1 * reload, 0, 2 * Math.PI, false);
				c.fill();
				c.stroke();
			}
		}
	}

	override reactToWorld() {}
}
