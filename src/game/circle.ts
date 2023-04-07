import { AABB } from "./aabb.js";
import { SHAPE_CIRCLE } from "./constants.js";
import { Shape } from "./shape.js";
import { Vector } from "./vector.js";

export class Circle implements Shape {
	center: Vector;
	radius: number;

	constructor(center: Vector, radius: number) {
		this.center = center;
		this.radius = radius;
	}

	copy() {
		return new Circle(this.center, this.radius);
	}

	getType() {
		return SHAPE_CIRCLE;
	}

	getAabb() {
		const radiusVector = new Vector(this.radius, this.radius);
		return new AABB(
			this.center.sub(radiusVector),
			this.center.add(radiusVector)
		);
	}

	getCenter() {
		return this.center;
	}

	moveBy(delta: Vector) {
		this.center = this.center.add(delta);
	}

	moveTo(destination: Vector) {
		this.center = destination;
	}

	offsetBy(offset: Vector) {
		return new Circle(this.center.add(offset), this.radius);
	}

	draw(c: CanvasRenderingContext2D) {
		c.strokeStyle = "black";
		c.beginPath();
		c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, false);
		c.stroke();
	}
}

export const isCircle = (shape: Shape): shape is Circle => {
	return shape.getType() === SHAPE_CIRCLE;
};
