import { AABB } from "./aabb.js";
import { SHAPE_POLYGON } from "./constants.js";
import { Segment } from "./segment.js";
import { Shape } from "./shape.js";
import { Vector } from "./vector.js";

export class Polygon implements Shape {
	center: Vector;
	vertices: Vector[];
	segments: Segment[];
	boundingBox: AABB;

	constructor(center: Vector, ...vertices: Vector[]) {
		this.center = center;
		this.vertices = vertices;
		this.segments = [];
		for (let i = 0; i < this.vertices.length; i++) {
			this.segments.push(
				new Segment(
					this.vertices[i],
					this.vertices[(i + 1) % this.vertices.length]
				)
			);
		}

		this.boundingBox = new AABB(this.vertices[0], this.vertices[0]);
		this.initializeBounds();
	}

	copy() {
		const polygon = new Polygon(this.center, this.vertices[0]);
		polygon.vertices = this.vertices;
		polygon.segments = this.segments;
		polygon.initializeBounds();
		return polygon;
	}

	getType() {
		return SHAPE_POLYGON;
	}

	moveBy(delta: Vector) {
		this.center = this.center.add(delta);
	}

	moveTo(destination: Vector) {
		this.center = destination;
	}

	getVertex(i: number) {
		return this.vertices[i].add(this.center);
	}

	getSegment(i: number) {
		return this.segments[i].offsetBy(this.center);
	}

	getAabb() {
		return this.boundingBox.offsetBy(this.center);
	}

	getCenter() {
		return this.center;
	}

	// expand the aabb and the bounding circle to contain all vertices
	initializeBounds() {
		for (let i = 0; i < this.vertices.length; i++) {
			const vertex = this.vertices[i];

			// expand the bounding box to include this vertex
			this.boundingBox = this.boundingBox.include(vertex);
		}
	}

	draw(c: CanvasRenderingContext2D) {
		c.strokeStyle = "black";
		c.beginPath();
		for (let i = 0; i < this.vertices.length; i++) {
			c.lineTo(
				this.vertices[i].x + this.center.x,
				this.vertices[i].y + this.center.y
			);
		}
		c.closePath();
		c.stroke();
	}
}

export const isPolygon = (shape: Shape): shape is Polygon => {
	return shape.getType() === SHAPE_POLYGON;
};
