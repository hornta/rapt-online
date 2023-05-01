import { Circle } from "../circle";
import { Enemy } from "../enemy";
import { Vector } from "../vector";

export abstract class WalkingEnemy extends Enemy {
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

	override move(seconds: number) {
		return this.velocity.mul(seconds);
	}
}
