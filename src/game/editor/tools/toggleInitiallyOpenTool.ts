import { rgba } from "../../utils";
import { Vector } from "../../vector";
import { Document } from "../document";
import { Door } from "../placeables/door";
import { Tool } from "./tool";

export class ToggleInitiallyOpenTool extends Tool {
	doc: Document;
	door: Door | null;

	constructor(doc: Document) {
		super();
		this.doc = doc;
		this.door = null;
	}

	mouseDown(point: Vector) {
		this.mouseMoved(point);
		if (this.door !== null) {
			this.doc.toggleInitiallyOpen(this.door);
		}
	}

	mouseMoved(point: Vector) {
		this.door = this.doc.world.closestPlaceableOfType<Door>(point, "door");
	}

	mouseUp() {}

	draw(c: CanvasRenderingContext2D) {
		if (this.door !== null) {
			c.fillStyle = rgba(0, 0, 0, 0);
			c.strokeStyle = rgba(0, 0, 0, 0.5);
			this.door.drawSelection(c);
		}
	}
}
