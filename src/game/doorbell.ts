import { AABB } from "./aabb";
import { ENEMY_DOORBELL, PLAYER_HEIGHT } from "./constants";
import { Enemy } from "./enemy";
import { gameState } from "./game";
import { randInRange } from "./math";
import { Particle } from "./particle";
import { Vector } from "./vector";

// Must be wider and taller than the player to avoid double toggling
const DOORBELL_WIDTH = 0.4;
const DOORBELL_HEIGHT = PLAYER_HEIGHT + 0.01;
const DOORBELL_RADIUS = 0.11;
const DOORBELL_SLICES = 3;

export class Doorbell extends Enemy {
	hitBox: AABB;
	rotationPercent: number;
	restingAngle: number;
	behavior: 0 | 1 | 2;
	visible: boolean;
	triggeredLastTick: boolean;
	triggeredThisTick: boolean;
	doors: number[];

	constructor(center: Vector, behavior: 0 | 1 | 2, visible: boolean) {
		super(ENEMY_DOORBELL, 1);
		this.hitBox = AABB.makeAABB(center, DOORBELL_WIDTH, DOORBELL_HEIGHT);
		this.rotationPercent = 1;
		this.restingAngle = randInRange(0, 2 * Math.PI);
		this.behavior = behavior;
		this.visible = visible;
		this.triggeredLastTick = false;
		this.triggeredThisTick = false;
		this.doors = [];
	}

	getShape() {
		return this.hitBox;
	}

	addDoor(doorIndex: number) {
		this.doors.push(doorIndex);
	}

	canCollide() {
		return false;
	}

	tick(seconds: number) {
		this.rotationPercent += seconds;
		if (this.rotationPercent > 1) {
			this.rotationPercent = 1;
		}

		this.triggeredThisTick = false;
		Enemy.prototype.tick.call(this, seconds);
		this.triggeredLastTick = this.triggeredThisTick;
	}

	reactToPlayer() {
		this.triggeredThisTick = true;
		if (this.triggeredLastTick) {
			return;
		}

		for (let i = 0; i < this.doors.length; ++i) {
			gameState.getDoor(this.doors[i]).act(this.behavior, false, true);
		}

		for (let i = 0; i < 50; ++i) {
			const rotationAngle = randInRange(0, 2 * Math.PI);
			const direction = Vector.fromAngle(rotationAngle).mul(randInRange(3, 5));
			Particle()
				.position(this.getCenter())
				.velocity(direction)
				.angle(rotationAngle)
				.radius(0.05)
				.bounces(3)
				.elasticity(0.5)
				.decay(0.01)
				.line()
				.color(1, 1, 1, 1);
		}

		this.rotationPercent = 0;
	}

	draw(c: CanvasRenderingContext2D) {
		if (this.visible) {
			const pos = this.getCenter();
			const startingAngle =
				this.restingAngle + (2 * Math.PI) / 3 / (this.rotationPercent + 0.1);

			c.fillStyle = "white";
			c.strokeStyle = "black";
			c.beginPath();
			c.arc(pos.x, pos.y, DOORBELL_RADIUS, 0, 2 * Math.PI, false);
			c.fill();
			c.stroke();

			c.beginPath();
			for (let i = 0; i < DOORBELL_SLICES; ++i) {
				c.moveTo(pos.x, pos.y);
				const nextPos = pos.add(
					Vector.fromAngle(
						startingAngle + (i - 0.5) * ((2 * Math.PI) / DOORBELL_SLICES)
					).mul(DOORBELL_RADIUS)
				);
				c.lineTo(nextPos.x, nextPos.y);
			}
			c.stroke();
		}
	}

	afterTick() {}
}
