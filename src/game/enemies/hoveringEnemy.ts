import { Circle } from "../circle";
import { Enemy } from "../enemy";
import { Vector } from "../vector";

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
