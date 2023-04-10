import { Vector } from "../../vector.js";
import { Document } from "../document.js";
import { drawGoal } from "../sprites.js";
import { Tool } from "./tool.js";

export class SetPlayerGoalTool extends Tool {
	doc: Document;
	point: Vector | null;
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
			this.doc.setPlayerGoal(
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
			drawGoal(c, 0.5, this.point.floor().add(new Vector(0.5, 0.5)), 0.6);
		}
	}
}
