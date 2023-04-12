import { Vector } from "../vector";
import { Edge } from "./edge";

export class Rectangle {
	min: Vector;
	max: Vector;

	constructor(start: Vector, end: Vector) {
		this.min = new Vector(Math.min(start.x, end.x), Math.min(start.y, end.y));
		this.max = new Vector(Math.max(start.x, end.x), Math.max(start.y, end.y));
	}

	containsPoint(point: Vector) {
		return (
			point.x >= this.min.x &&
			point.x < this.max.x &&
			point.y >= this.min.y &&
			point.y < this.max.y
		);
	}

	intersectsRect(rect: Rectangle) {
		return (
			this.min.x < rect.max.x &&
			rect.min.x < this.max.x &&
			this.min.y < rect.max.y &&
			rect.min.y < this.max.y
		);
	}

	intersectsEdge(edge: Edge) {
		let total = 0;
		total += Number(edge.pointBehindEdge(this.min));
		total += Number(edge.pointBehindEdge(new Vector(this.min.x, this.max.y)));
		total += Number(edge.pointBehindEdge(new Vector(this.max.x, this.min.y)));
		total += Number(edge.pointBehindEdge(this.max));
		return total !== 0 && total !== 4;
	}

	expand(x: number, y: number) {
		const padding = new Vector(x, y);
		return new Rectangle(this.min.sub(padding), this.max.add(padding));
	}
}

export class Circle {
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

	intersectsRect(rect: Rectangle) {
		const topLeft = new Vector(rect.min.x, rect.max.y);
		const topRight = rect.max;
		const bottomLeft = rect.min;
		const bottomRight = new Vector(rect.max.x, rect.min.y);
		return (
			rect.containsPoint(this.#center) ||
			this.intersectsEdge(new Edge(topLeft, topRight)) ||
			this.intersectsEdge(new Edge(topRight, bottomRight)) ||
			this.intersectsEdge(new Edge(bottomRight, bottomLeft)) ||
			this.intersectsEdge(new Edge(bottomLeft, topLeft)) ||
			this.containsPoint(rect.min)
		);
	}

	intersectsEdge(edge: Edge) {
		const dir = edge.end.sub(edge.start);
		const fromCenter = edge.start.sub(this.#center);
		const a = dir.lengthSquared();
		const b = 2 * dir.dot(fromCenter);
		const c = fromCenter.lengthSquared() - this.#radius * this.#radius;
		const discriminant = b * b - 4 * a * c;
		if (discriminant >= 0) {
			const tb = -b / (2 * a);
			const td = Math.sqrt(discriminant) / (2 * a);
			const t1 = tb + td;
			const t2 = tb - td;
			return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
		}
		return false;
	}
}

export class Polygon {
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
