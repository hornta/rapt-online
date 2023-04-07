import { Circle } from "../circle.js";
import { Enemy } from "../enemy.js";
import { Player } from "../player.js";
import { Vector } from "../vector.js";

export const FREEFALL_ACCEL = -6;

export class FreefallEnemy extends Enemy {
	hitCircle: Circle;
	constructor(
		type: number,
		center: Vector,
		radius: number,
		elasticity: number
	) {
		super(type, elasticity);

		this.hitCircle = new Circle(center, radius);
	}

	getShape() {
		return this.hitCircle;
	}

	draw(c: CanvasRenderingContext2D) {
		const pos = this.hitCircle.center;
		c.fillStyle = "black";
		c.beginPath();
		c.arc(pos.x, pos.y, this.hitCircle.radius, 0, Math.PI * 2, false);
		c.fill();
	}

	move(seconds: number) {
		return this.accelerate(new Vector(0, FREEFALL_ACCEL), seconds);
	}

	reactToWorld() {
		this.isDead = true;
	}

	reactToPlayer(player: Player) {
		this.isDead = true;
		player.isDead = true;
	}

	afterTick() {}
}
