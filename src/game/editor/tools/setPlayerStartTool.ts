import { Vector } from "../../vector";
import { Document } from "../document";
import { drawSpawnPoint } from "../sprites";
import { Tool } from "./tool";

export class SetPlayerStartTool extends Tool {
	doc: Document;
	point: null | Vector;
	dragging: boolean;

	constructor(doc: Document) {
		super();

		this.doc = doc;
		this.point = null;
		this.dragging = false;
	}

	mouseDown(point: Vector) {
		this.dragging = true;
		this.doc.undoStack.beginMacro();
		this.mouseMoved(point);
	}

	mouseMoved(point: Vector) {
		if (this.dragging) {
			this.doc.setPlayerStart(
				new Vector(Math.floor(point.x), Math.floor(point.y))
			);
		}
		this.point = point;
	}

	mouseUp() {
		this.dragging = false;
		this.doc.undoStack.endMacro();
	}

	draw(c: CanvasRenderingContext2D) {
		if (this.point !== null) {
			drawSpawnPoint(c, 0.5, this.point.floor().add(new Vector(0.5, 0.5)));
		}
	}
}
