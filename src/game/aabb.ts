import { SHAPE_AABB } from "./constants";
import { Polygon } from "./polygon";
import { Shape } from "./shape";
import { Vector } from "./vector";

export class AABB implements Shape {
	lowerLeft: Vector;
	size: Vector;

	constructor(lowerLeft: Vector, upperRight: Vector) {
		this.lowerLeft = new Vector(
			Math.min(lowerLeft.x, upperRight.x),
			Math.min(lowerLeft.y, upperRight.y)
		);
		this.size = new Vector(
			Math.max(lowerLeft.x, upperRight.x),
			Math.max(lowerLeft.y, upperRight.y)
		).sub(this.lowerLeft);
	}

	static makeAABB(center: Vector, width: number, height: number) {
		const halfSize = new Vector(width * 0.5, height * 0.5);
		const lowerLeft = center.sub(halfSize);
		const upperRight = center.add(halfSize);
		return new AABB(lowerLeft, upperRight);
	}

	getTop() {
		return this.lowerLeft.y + this.size.y;
	}

	getLeft() {
		return this.lowerLeft.x;
	}

	getRight() {
		return this.lowerLeft.x + this.size.x;
	}

	getBottom() {
		return this.lowerLeft.y;
	}

	getWidth() {
		return this.size.x;
	}

	getHeight() {
		return this.size.y;
	}

	copy() {
		return new AABB(this.lowerLeft, this.lowerLeft.add(this.size));
	}

	getPolygon() {
		const center = this.getCenter();
		const halfSize = this.size.div(2);
		return new Polygon(
			center,
			new Vector(+halfSize.x, +halfSize.y),
			new Vector(-halfSize.x, +halfSize.y),
			new Vector(-halfSize.x, -halfSize.y),
			new Vector(+halfSize.x, -halfSize.y)
		);
	}

	getType() {
		return SHAPE_AABB;
	}

	getAabb() {
		return this;
	}

	moveBy(delta: Vector) {
		this.lowerLeft = this.lowerLeft.add(delta);
	}

	moveTo(destination: Vector) {
		this.lowerLeft = destination.sub(this.size.div(2));
	}

	getCenter() {
		return this.lowerLeft.add(this.size.div(2));
	}

	expand(margin: number) {
		const marginVector = new Vector(margin, margin);
		return new AABB(
			this.lowerLeft.sub(marginVector),
			this.lowerLeft.add(this.size).add(marginVector)
		);
	}

	union(aabb: AABB) {
		return new AABB(
			this.lowerLeft.minComponents(aabb.lowerLeft),
			this.lowerLeft.add(this.size).maxComponents(aabb.lowerLeft.add(aabb.size))
		);
	}

	include(point: Vector) {
		return new AABB(
			this.lowerLeft.minComponents(point),
			this.lowerLeft.add(this.size).maxComponents(point)
		);
	}

	offsetBy(offset: Vector) {
		return new AABB(
			this.lowerLeft.add(offset),
			this.lowerLeft.add(this.size).add(offset)
		);
	}

	draw(c: CanvasRenderingContext2D) {
		c.strokeStyle = "black";
		c.strokeRect(this.lowerLeft.x, this.lowerLeft.y, this.size.x, this.size.y);
	}
}

export const isAABB = (shape: Shape): shape is AABB => {
	return shape.getType() === SHAPE_AABB;
};
