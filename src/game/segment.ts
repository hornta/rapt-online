import { Vector } from "./vector";

export class Segment {
	start: Vector;
	end: Vector;
	normal: Vector;

	constructor(start: Vector, end: Vector) {
		this.start = start;
		this.end = end;
		this.normal = end.sub(start).flip().unit();
	}

	offsetBy(offset: Vector) {
		return new Segment(this.start.add(offset), this.end.add(offset));
	}

	draw(c: CanvasRenderingContext2D) {
		c.beginPath();
		c.moveTo(this.start.x, this.start.y);
		c.lineTo(this.end.x, this.end.y);
		c.stroke();
	}
}
