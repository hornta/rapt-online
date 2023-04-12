import { getClosestEdge } from "../../utils";
import { Vector } from "../../vector";
import { Document } from "../document";
import { Edge } from "../edge";
import { Door } from "../placeables/door";
import { Tool } from "./tool";

export class PlaceDoorTool extends Tool {
	doc: Document;
	isOneWay: boolean;
	isInitiallyOpen: boolean;
	color: 0 | 1 | 2;
	edge: null | Edge;

	constructor(
		doc: Document,
		isOneWay: boolean,
		isInitiallyOpen: boolean,
		color: 0 | 1 | 2
	) {
		super();

		this.doc = doc;
		this.isOneWay = isOneWay;
		this.isInitiallyOpen = isInitiallyOpen;
		this.color = color;
		this.edge = null;
	}

	mouseDown(point: Vector) {
		this.mouseMoved(point);
		this.doc.addPlaceable(
			new Door(this.isOneWay, this.isInitiallyOpen, this.color, this.edge!)
		);
	}

	mouseMoved(point: Vector) {
		// Generate all the edges in the cell under point
		const x = Math.floor(point.x);
		const y = Math.floor(point.y);
		const p00 = new Vector(x, y);
		const p10 = new Vector(x + 1, y);
		const p01 = new Vector(x, y + 1);
		const p11 = new Vector(x + 1, y + 1);
		const edges = [
			new Edge(p00, p10),
			new Edge(p01, p00),
			new Edge(p00, p11),
			new Edge(p10, p01),
			new Edge(p10, p11),
			new Edge(p11, p01),
		];

		// Pick the closest edge facing away from point
		this.edge = getClosestEdge(point, edges);
		if (this.edge!.pointBehindEdge(point)) {
			this.edge!.flip();
		}
	}

	mouseUp() {}

	draw(c: CanvasRenderingContext2D) {
		if (this.edge !== null) {
			const door = new Door(this.isOneWay, false, this.color, this.edge);
			door.draw(c, 0.5);
		}
	}
}
