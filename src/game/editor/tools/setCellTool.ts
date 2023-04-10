import {
	CELL_FLOOR_DIAG_LEFT,
	CELL_CEIL_DIAG_LEFT,
	CELL_FLOOR_DIAG_RIGHT,
	CELL_CEIL_DIAG_RIGHT,
	CELL_EMPTY,
	CELL_SOLID,
} from "../../constants.js";
import { rgba } from "../../utils.js";
import { Vector } from "../../vector.js";
import { Cell } from "../cell.js";
import { Document } from "../document.js";
import { Tool } from "./tool.js";

export const SETCELL_EMPTY = 0;
export const SETCELL_SOLID = 1;
export const SETCELL_DIAGONAL = 2;

export class SetCellTool extends Tool {
	doc: Document;
	mode: 0 | 1 | 2;
	dragging: boolean;
	cellX: number | null;
	cellY: number | null;
	cellType: null | 0 | 1 | 2 | 3 | 4 | 5;

	constructor(doc: Document, mode: 0 | 1 | 2) {
		super();

		this.doc = doc;
		this.mode = mode;
		this.dragging = false;
		this.cellX = null;
		this.cellY = null;
		this.cellType = null;
	}

	mouseDown(point: Vector) {
		this.doc.undoStack.beginMacro();
		this.dragging = true;
		this.mouseMoved(point);
	}

	mouseMoved(point: Vector) {
		this.cellX = Math.floor(point.x);
		this.cellY = Math.floor(point.y);

		if (this.mode === SETCELL_DIAGONAL) {
			// Pick a different cell type depending on the quadrant
			if (point.x - this.cellX < 0.5) {
				this.cellType =
					point.y - this.cellY < 0.5
						? CELL_FLOOR_DIAG_LEFT
						: CELL_CEIL_DIAG_LEFT;
			} else {
				this.cellType =
					point.y - this.cellY < 0.5
						? CELL_FLOOR_DIAG_RIGHT
						: CELL_CEIL_DIAG_RIGHT;
			}
		} else {
			this.cellType = this.mode === SETCELL_EMPTY ? CELL_EMPTY : CELL_SOLID;
		}

		// Only change the cell type if it's different
		if (
			this.dragging &&
			this.doc.world.getCell(this.cellX, this.cellY) !== this.cellType
		) {
			this.doc.setCell(this.cellX, this.cellY, this.cellType);
		}
	}

	mouseUp() {
		this.doc.undoStack.endMacro();
		this.dragging = false;
	}

	draw(c: CanvasRenderingContext2D) {
		if (this.cellType !== null) {
			// Fill in the empty space
			const cell = new Cell();
			cell.type = this.cellType;
			c.fillStyle = rgba(191, 191, 191, 0.5);
			cell.draw(c, this.cellX!, this.cellY!);

			// Fill in the solid space
			cell.flipType();
			c.fillStyle = rgba(127, 127, 127, 0.5);
			cell.draw(c, this.cellX!, this.cellY!);
		}
	}
}
