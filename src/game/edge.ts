import {
	EDGE_NEUTRAL,
	EDGE_RED,
	EDGE_BLUE,
	EDGE_PLAYERS,
	EDGE_ENEMIES,
	EDGE_CEILING,
	EDGE_FLOOR,
	EDGE_LEFT,
	EDGE_RIGHT,
} from "./constants";
import { Segment } from "./segment";
import { Vector } from "./vector";

export class Edge {
	segment: Segment;
	color: number;

	constructor(start: Vector, end: Vector, color: number) {
		this.segment = new Segment(start, end);
		this.color = color;
	}

	blocksColor(entityColor: number) {
		switch (this.color) {
			case EDGE_NEUTRAL:
				return true;
			case EDGE_RED:
				return entityColor !== EDGE_RED;
			case EDGE_BLUE:
				return entityColor !== EDGE_BLUE;
			case EDGE_PLAYERS:
				return entityColor !== EDGE_RED && entityColor !== EDGE_BLUE;
			case EDGE_ENEMIES:
				return entityColor !== EDGE_ENEMIES;
		}
		return false;
	}

	getStart() {
		return this.segment.start;
	}

	getEnd() {
		return this.segment.end;
	}

	getOrientation() {
		return Edge.getOrientation(this.segment.normal);
	}

	static getOrientation(normal: Vector) {
		if (normal.x > 0.9) {
			return EDGE_LEFT;
		}
		if (normal.x < -0.9) {
			return EDGE_RIGHT;
		}
		if (normal.y < 0) {
			return EDGE_CEILING;
		}
		return EDGE_FLOOR;
	}

	draw(c: CanvasRenderingContext2D) {
		switch (this.color) {
			case EDGE_NEUTRAL:
				c.strokeStyle = "black";
				break;
			case EDGE_RED:
				c.strokeStyle = "#C00000";
				break;
			case EDGE_BLUE:
				c.strokeStyle = "#0000D2";
				break;
		}
		this.segment.draw(c);

		const xOffset = this.segment.normal.x * 0.1;
		const yOffset = this.segment.normal.y * 0.1;

		c.beginPath();
		for (let i = 1, num = 10; i < num - 1; ++i) {
			const fraction = i / (num - 1);
			const start = this.segment.start
				.mul(fraction)
				.add(this.segment.end.mul(1 - fraction));
			c.moveTo(start.x, start.y);
			c.lineTo(start.x - xOffset, start.y - yOffset);
		}
		c.stroke();
	}
}
