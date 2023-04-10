import {
	CELL_SOLID,
	CELL_CEIL_DIAG_LEFT,
	CELL_CEIL_DIAG_RIGHT,
	CELL_FLOOR_DIAG_LEFT,
	CELL_FLOOR_DIAG_RIGHT,
} from "./constants.js";
import { Edge } from "./edge.js";
import { Polygon } from "./polygon.js";
import { Vector } from "./vector.js";

export class Cell {
	x: number;
	y: number;
	type: number;
	edges: Edge[] = [];

	constructor(x: number, y: number, type: number) {
		this.x = x;
		this.y = y;
		this.type = type;
	}

	bottomLeft() {
		return new Vector(this.x, this.y);
	}

	bottomRight() {
		return new Vector(this.x + 1, this.y);
	}

	topLeft() {
		return new Vector(this.x, this.y + 1);
	}

	topRight() {
		return new Vector(this.x + 1, this.y + 1);
	}

	ceilingOccupied() {
		return (
			this.type === CELL_SOLID ||
			this.type === CELL_CEIL_DIAG_LEFT ||
			this.type === CELL_CEIL_DIAG_RIGHT
		);
	}

	floorOccupied() {
		return (
			this.type === CELL_SOLID ||
			this.type === CELL_FLOOR_DIAG_LEFT ||
			this.type === CELL_FLOOR_DIAG_RIGHT
		);
	}

	leftWallOccupied() {
		return (
			this.type === CELL_SOLID ||
			this.type === CELL_FLOOR_DIAG_LEFT ||
			this.type === CELL_CEIL_DIAG_LEFT
		);
	}

	rightWallOccupied() {
		return (
			this.type === CELL_SOLID ||
			this.type === CELL_FLOOR_DIAG_RIGHT ||
			this.type === CELL_CEIL_DIAG_RIGHT
		);
	}

	// This diagonal: /
	posDiagOccupied() {
		return (
			this.type === CELL_SOLID ||
			this.type === CELL_FLOOR_DIAG_RIGHT ||
			this.type === CELL_CEIL_DIAG_LEFT
		);
	}

	// This diagonal: \
	negDiagOccupied() {
		return (
			this.type === CELL_SOLID ||
			this.type === CELL_FLOOR_DIAG_LEFT ||
			this.type === CELL_CEIL_DIAG_RIGHT
		);
	}

	addEdge(newEdge: Edge) {
		this.edges.push(newEdge);
	}

	removeEdge(edge: Edge) {
		const edgeIndex = this.getEdge(edge);
		this.edges.splice(edgeIndex, 1);
	}

	// returns all edges that block this color
	getBlockingEdges(color: number) {
		const blockingEdges = [];
		for (let i = 0; i < this.edges.length; i++) {
			if (this.edges[i].blocksColor(color)) {
				blockingEdges.push(this.edges[i]);
			}
		}
		return blockingEdges;
	}

	getEdge(edge: Edge) {
		for (let i = 0; i < this.edges.length; ++i) {
			const thisEdge = this.edges[i];
			if (
				thisEdge.getStart().sub(edge.getStart()).lengthSquared() < 0.001 &&
				thisEdge.getEnd().sub(edge.getEnd()).lengthSquared() < 0.001
			) {
				return i;
			}
		}
		return -1;
	}

	// returns a polygon that represents this cell
	getShape() {
		const vxy = new Vector(this.x, this.y);
		const v00 = new Vector(0, 0);
		const v01 = new Vector(0, 1);
		const v10 = new Vector(1, 0);
		const v11 = new Vector(1, 1);
		switch (this.type) {
			case CELL_SOLID:
				return new Polygon(vxy, v00, v10, v11, v01);
			case CELL_FLOOR_DIAG_LEFT:
				return new Polygon(vxy, v00, v10, v01);
			case CELL_FLOOR_DIAG_RIGHT:
				return new Polygon(vxy, v00, v10, v11);
			case CELL_CEIL_DIAG_LEFT:
				return new Polygon(vxy, v00, v11, v01);
			case CELL_CEIL_DIAG_RIGHT:
				return new Polygon(vxy, v01, v10, v11);
		}
		return null;
	}

	draw(c: CanvasRenderingContext2D) {
		const x = this.x;
		const y = this.y;
		c.beginPath();
		if (this.type === CELL_SOLID) {
			c.moveTo(x, y);
			c.lineTo(x, y + 1);
			c.lineTo(x + 1, y + 1);
			c.lineTo(x + 1, y);
		} else if (this.type === CELL_FLOOR_DIAG_LEFT) {
			c.moveTo(x, y);
			c.lineTo(x + 1, y);
			c.lineTo(x, y + 1);
		} else if (this.type === CELL_FLOOR_DIAG_RIGHT) {
			c.moveTo(x, y);
			c.lineTo(x + 1, y + 1);
			c.lineTo(x + 1, y);
		} else if (this.type === CELL_CEIL_DIAG_LEFT) {
			c.moveTo(x, y);
			c.lineTo(x, y + 1);
			c.lineTo(x + 1, y + 1);
		} else if (this.type === CELL_CEIL_DIAG_RIGHT) {
			c.moveTo(x + 1, y);
			c.lineTo(x, y + 1);
			c.lineTo(x + 1, y + 1);
		}
		c.closePath();
		c.fill();
		c.stroke();
	}

	drawEdges(c: CanvasRenderingContext2D) {
		for (let i = 0; i < this.edges.length; i++) {
			this.edges[i].draw(c);
		}
	}
}
