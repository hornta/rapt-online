import { Vector } from "../vector.js";

export class Edge {
	start: Vector;
	end: Vector;

	constructor(start: Vector, end: Vector) {
		this.start = start;
		this.end = end;
	}

	squaredDistanceToPoint(point: Vector) {
		const line = this.end.sub(this.start);
		let t = point.sub(this.start).dot(line) / line.lengthSquared();

		// The 0.01 is for disambiguating edges with the same end point (to pick the closer one)
		t = Math.max(0.01, Math.min(0.99, t));

		const closest = this.start.add(line.mul(t));
		return closest.sub(point).lengthSquared();
	}

	pointBehindEdge(point: Vector) {
		return point.sub(this.start).dot(this.end.sub(this.start).flip()) < 0;
	}

	flip() {
		const temp = this.start;
		this.start = this.end;
		this.end = temp;
	}

	pointAlongLine(fraction: number) {
		return this.start.mul(1 - fraction).add(this.end.mul(fraction));
	}

	drawDirectionIndicators(
		c: CanvasRenderingContext2D,
		isInitiallyOpen: boolean
	) {
		const normal = this.end.sub(this.start).flip().unit();
		for (let i = 1, num = 10; i < num - 1; i++) {
			const point = this.pointAlongLine(i / (num - 1));
			const d = isInitiallyOpen ? 0.05 : 0;
			c.moveTo(point.x + normal.x * d, point.y + normal.y * d);
			c.lineTo(point.x + normal.x * 0.1, point.y + normal.y * 0.1);
		}
	}

	draw(c: CanvasRenderingContext2D) {
		c.beginPath();
		c.moveTo(this.start.x, this.start.y);
		c.lineTo(this.end.x, this.end.y);
		this.drawDirectionIndicators(c, false);
		c.stroke();
	}

	drawOpen(c: CanvasRenderingContext2D) {
		c.beginPath();
		c.moveTo(this.start.x, this.start.y);
		c.lineTo(this.end.x, this.end.y);
		this.drawDirectionIndicators(c, true);
		c.stroke();
	}
}
