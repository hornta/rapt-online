import { Circle } from "../circle";
import { Enemy } from "../enemy";
import { Vector } from "../vector";

/**
 * Abstract class representing enemies that may rotating, including seeking enemies.
 * These enemies are all circular.
 */
export abstract class RotatingEnemy extends Enemy {
	hitCircle: Circle;
	heading: number;

	constructor(
		type: number,
		center: Vector,
		radius: number,
		heading: number,
		elasticity: number
	) {
		super(type, elasticity);

		this.hitCircle = new Circle(center, radius);
		this.heading = heading;
	}

	getShape() {
		return this.hitCircle;
	}
}
