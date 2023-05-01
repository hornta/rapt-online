import { rgba } from "../../utils";
import { Vector } from "../../vector";
import { Document } from "../document";
import { BasePlaceable } from "../placeables/placeable";
import { Sprite } from "../placeables/sprite";
import { Rectangle } from "../shapes";
import { Tool } from "./tool";

const SELECTION_MODE_NONE = 0;
const SELECTION_MODE_SELECT = 1;
const SELECTION_MODE_MOVE = 2;
const SELECTION_MODE_ROTATE = 3;

export class SelectionTool extends Tool {
	doc: Document;
	mode: 0 | 1 | 2 | 3 | 4;
	start: null | Vector;
	end: null | Vector;
	originalSelection: BasePlaceable[];
	rotationOrigin: null | Vector;

	constructor(doc: Document) {
		super();

		this.doc = doc;
		this.mode = SELECTION_MODE_NONE;
		this.start = this.end = null;
		this.modifierKeyPressed = false;
		this.originalSelection = [];
		this.rotationOrigin = null;
	}

	mouseDown(point: Vector) {
		let i;
		let j;

		this.originalSelection = this.doc.world.getSelection();
		this.doc.undoStack.beginMacro();

		// Check if we clicked on an existing selection
		let clickedOnSelection = false;
		const padding = new Vector(0.1, 0.1);
		const selectionUnderMouse = this.doc.world.selectionInRect(
			new Rectangle(point.sub(padding), point.add(padding))
		);
		for (i = 0; i < selectionUnderMouse.length; i++) {
			for (j = 0; j < this.originalSelection.length; j++) {
				if (selectionUnderMouse[i] === this.originalSelection[j]) {
					clickedOnSelection = true;
					break;
				}
			}
		}

		// If we clicked on an existing selection, move it around instead
		if (clickedOnSelection) {
			this.mode = SELECTION_MODE_MOVE;
			this.start = point;
			return;
		}

		// Next, check if we clicked on an angle polygon
		let clickedOnAnglePolygon = false;
		for (i = 0; i < this.originalSelection.length; i++) {
			const s = this.originalSelection[i];
			if (s instanceof Sprite && s.hasAnglePolygon()) {
				const p = s.getAnglePolygon();
				if (p.containsPoint(point)) {
					clickedOnAnglePolygon = true;
					this.rotationOrigin = s.anchor;
					break;
				}
			}
		}

		// If we clicked on an angle polygon, rotate the selection instead (about that sprite)
		if (clickedOnAnglePolygon) {
			this.mode = SELECTION_MODE_ROTATE;
			this.start = point;
		} else if (!this.modifierKeyPressed && selectionUnderMouse.length > 0) {
			// If you drag an unselected element, set that as the selection so it doesn't take two clicks to move something
			this.mode = SELECTION_MODE_MOVE;
			this.start = point;
			this.doc.setSelection(selectionUnderMouse);
		} else {
			this.mode = SELECTION_MODE_SELECT;
			this.start = this.end = point;
			this.mouseMoved(point);
		}
	}

	mouseMoved(point: Vector) {
		this.end = point;
		if (this.mode === SELECTION_MODE_SELECT) {
			const newSelection = this.doc.world.selectionInRect(
				new Rectangle(this.start!, this.end)
			);
			if (this.modifierKeyPressed) {
				// add anything in original but not in new (additive), and remove anything in both (subtractive)
				for (let i = 0; i < this.originalSelection.length; i++) {
					const s = this.originalSelection[i];
					let j = 0;
					for (; j < newSelection.length; j++) {
						if (s === newSelection[j]) {
							break;
						}
					}
					if (j === newSelection.length) {
						// add element in original but not in new (additive)
						newSelection.push(s);
					} else {
						// remove element in both (subtractive)
						newSelection.splice(j--, 1);
					}
				}
			}
			this.doc.setSelection(newSelection);
		} else if (this.mode === SELECTION_MODE_MOVE) {
			this.doc.moveSelection(point.sub(this.start!));
			this.start = point;
		} else if (this.mode === SELECTION_MODE_ROTATE) {
			const deltaAngle =
				point.sub(this.rotationOrigin!).atan2() -
				this.start!.sub(this.rotationOrigin!).atan2();
			this.doc.rotateSelection(deltaAngle);
			this.start = point;
		}
	}

	mouseUp() {
		if (this.mode === SELECTION_MODE_MOVE) {
			// Reset all anchors, needed for placeables that lock to the grid (walls/doors)
			const selection = this.doc.world.getSelection();
			for (let i = 0; i < selection.length; i++) {
				selection[i].resetAnchor();
			}
		}
		this.mode = SELECTION_MODE_NONE;
		this.doc.undoStack.endMacro();
	}

	draw(c: CanvasRenderingContext2D) {
		if (this.mode === SELECTION_MODE_SELECT) {
			c.fillStyle = rgba(0, 0, 0, 0.1);
			c.strokeStyle = rgba(0, 0, 0, 0.5);
			c.fillRect(
				this.start!.x,
				this.start!.y,
				this.end!.x - this.start!.x,
				this.end!.y - this.start!.y
			);
			c.strokeRect(
				this.start!.x,
				this.start!.y,
				this.end!.x - this.start!.x,
				this.end!.y - this.start!.y
			);
		}
	}
}
