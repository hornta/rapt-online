import { Circle } from "../circle.js";
import { Enemy } from "../enemy.js";
import { Vector } from "../vector.js";

export abstract class HoveringEnemy extends Enemy {
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
}
