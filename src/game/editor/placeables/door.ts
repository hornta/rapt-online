import { COLOR_RED, COLOR_BLUE } from "../../constants";
import { rgba } from "../../utils";
import { Vector } from "../../vector";
import { Edge } from "../edge";
import { Rectangle } from "../shapes";
import { BasePlaceable } from "./placeable";

export class Door extends BasePlaceable {
	isOneWay: boolean;
	isInitiallyOpen: boolean;
	edge: Edge;
	color: 0 | 1 | 2;
	offsetToStart: Vector;
	offsetToEnd: Vector;

	constructor(
		isOneWay: boolean,
		isInitiallyOpen: boolean,
		color: 0 | 1 | 2,
		edge: Edge
	) {
		super("door", new Vector(0, 0), 0);

		this.isOneWay = isOneWay;
		this.isInitiallyOpen = isInitiallyOpen;
		this.edge = edge;
		this.color = color;
		this.selected = false;
		this.resetAnchor();
		this.offsetToStart = edge.start.sub(this.anchor!);
		this.offsetToEnd = edge.end.sub(this.anchor!);
	}

	draw(c: CanvasRenderingContext2D, alpha?: number) {
		c.strokeStyle = rgba(
			255 * Number(this.color === COLOR_RED),
			0,
			255 * Number(this.color === COLOR_BLUE),
			alpha ?? 1
		);
		if (this.isInitiallyOpen) {
			this.edge.drawOpen(c);
			if (!this.isOneWay) {
				this.edge.flip();
				this.edge.drawOpen(c);
				this.edge.flip();
			}
		} else {
			this.edge.draw(c);
			if (!this.isOneWay) {
				this.edge.flip();
				this.edge.draw(c);
				this.edge.flip();
			}
		}
	}

	drawSelection(c: CanvasRenderingContext2D) {
		const radius = 0.2;
		const angle = this.edge.end.sub(this.edge.start).atan2() + Math.PI / 2;
		c.beginPath();
		c.arc(
			this.edge.start.x,
			this.edge.start.y,
			radius,
			angle,
			angle + Math.PI,
			false
		);
		c.arc(
			this.edge.end.x,
			this.edge.end.y,
			radius,
			angle + Math.PI,
			angle,
			false
		);
		c.closePath();
		c.fill();
		c.stroke();
	}

	touchesRect(rect: Rectangle) {
		// Test if the bounding boxes intersect and the box actually lies across the line
		return (
			rect.intersectsRect(new Rectangle(this.edge.start, this.edge.end)) &&
			rect.intersectsEdge(this.edge)
		);
	}

	override setAnchor(anchor: Vector) {
		const floorAnchor = new Vector(
			Math.floor(anchor.x + 0.5),
			Math.floor(anchor.y + 0.5)
		);
		this.anchor = anchor;
		this.edge.start = floorAnchor.add(this.offsetToStart);
		this.edge.end = floorAnchor.add(this.offsetToEnd);
	}

	override resetAnchor() {
		this.anchor = new Vector(
			Math.min(this.edge.start.x, this.edge.end.x),
			Math.min(this.edge.start.y, this.edge.end.y)
		);
	}

	override getCenter() {
		return this.edge.start.add(this.edge.end).div(2);
	}

	override setAngle() {}
}
