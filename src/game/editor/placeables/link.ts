import { dashedLine, rgba } from "../../utils.js";
import { Vector } from "../../vector.js";
import { Edge } from "../edge.js";
import { Rectangle } from "../shapes.js";
import { Button } from "./button.js";
import { Door } from "./door.js";
import { BasePlaceable } from "./placeable.js";

export class Link extends BasePlaceable {
	door: Door;
	button: Button;

	constructor(door: Door, button: Button) {
		super("link", new Vector(0, 0), 0);

		this.door = door;
		this.button = button;
	}

	draw(c: CanvasRenderingContext2D) {
		c.strokeStyle = rgba(0, 0, 0, 0.5);
		dashedLine(c, this.button.getCenter()!, this.door.getCenter());
	}

	drawSelection(c: CanvasRenderingContext2D) {
		const start = this.button.getCenter()!;
		const end = this.door.getCenter();
		const radius = 0.2;
		const angle = end.sub(start).atan2() + Math.PI / 2;
		c.beginPath();
		c.arc(start.x, start.y, radius, angle, angle + Math.PI, false);
		c.arc(end.x, end.y, radius, angle + Math.PI, angle, false);
		c.closePath();
		c.fill();
		c.stroke();
	}

	touchesRect(rect: Rectangle) {
		// Test if the bounding boxes intersect and the box actually lies across the line
		const start = this.button.getCenter()!;
		const end = this.door.getCenter();
		return (
			rect.intersectsRect(new Rectangle(start, end)) &&
			rect.intersectsEdge(new Edge(start, end))
		);
	}

	setAnchor() {}

	setAngle() {}
}
