import { Vector } from "../vector.js";

export class Rectangle implements Shape {
	#min: Vector;
	#max: Vector;

	constructor(start: Vector, end: Vector) {
		this.#min = new Vector(Math.min(start.x, end.x), Math.min(start.y, end.y));
		this.#max = new Vector(Math.max(start.x, end.x), Math.max(start.y, end.y));
	}

	containsPoint(point: Vector) {
		return (
			point.x >= this.#min.x &&
			point.x < this.#max.x &&
			point.y >= this.#min.y &&
			point.y < this.#max.y
		);
	}

	intersectsRect(rect: Rectangle) {
		return (
			this.#min.x < rect.#max.x &&
			rect.#min.x < this.#max.x &&
			this.#min.y < rect.#max.y &&
			rect.#min.y < this.#max.y
		);
	}

	expand(x: number, y: number) {
		const padding = new Vector(x, y);
		return new Rectangle(this.#min.sub(padding), this.#max.add(padding));
	}
}

export class Circle implements Shape {
	#center: Vector;
	#radius: number;

	constructor(center: Vector, radius: number) {
		this.#center = center;
		this.#radius = radius;
	}

	containsPoint(point: Vector) {
		return (
			this.#center.sub(point).lengthSquared() < this.#radius * this.#radius
		);
	}
}

export class Polygon implements Shape {
	#vertices: Vector[];

	constructor(...vertices: Vector[]) {
		this.#vertices = vertices;
	}

	containsPoint(point: Vector) {
		// Use winding number test (sum of angles == +/-2PI iff point in polygon)
		let total = 0;
		for (let i = 0; i < this.#vertices.length; i++) {
			const j = (i + 1) % this.#vertices.length;
			const di = this.#vertices[i].sub(point).unit();
			const dj = this.#vertices[j].sub(point).unit();
			total += Math.acos(di.dot(dj));
		}
		return Math.abs(Math.abs(total) - 2 * Math.PI) < 0.001;
	}

	draw(c: CanvasRenderingContext2D) {
		c.beginPath();
		for (let i = 0; i < this.#vertices.length; i++) {
			const v = this.#vertices[i];
			c.lineTo(v.x, v.y);
		}
		c.closePath();
		c.fill();
		c.stroke();
	}
}
