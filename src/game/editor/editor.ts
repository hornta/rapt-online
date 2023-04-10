import { LevelData } from "../../schemas.js";
import {
	CELL_EMPTY,
	MOUSE_LEFT,
	MOUSE_MIDDLE,
	MOUSE_RIGHT,
} from "../constants.js";
import { rgba } from "../utils.js";
import { Vector } from "../vector.js";
import { Document } from "./document.js";
import { enemies } from "./enemies.js";
import { Button } from "./placeables/button.js";
import { BasePlaceable } from "./placeables/placeable.js";
import {
	spriteTemplates,
	SPRITE_SIGN,
	SPRITE_COG,
	Sprite,
} from "./placeables/sprite.js";
import { Rectangle } from "./shapes.js";
import { AddPlaceableTool } from "./tools/addPlaceableTool.js";
import { CameraPanTool } from "./tools/cameraPanTool.js";
import { LinkButtonToDoorTool } from "./tools/linkButtonToDoorTool.js";
import { PlaceDoorTool } from "./tools/placeDoorTool.js";
import { SelectionTool } from "./tools/selectionTool.js";
import {
	SETCELL_DIAGONAL,
	SETCELL_EMPTY,
	SETCELL_SOLID,
	SetCellTool,
} from "./tools/setCellTool.js";
import { SetPlayerGoalTool } from "./tools/setPlayerGoalTool.js";
import { SetPlayerStartTool } from "./tools/setPlayerStartTool.js";
import { ToggleInitiallyOpenTool } from "./tools/toggleInitiallyOpenTool.js";
import { Tool } from "./tools/tool.js";

export const MODE_EMPTY = "empty";
export const MODE_SOLID = "solid";
export const MODE_DIAGONAL = "diagonal";
export const MODE_START = "start";
export const MODE_GOAL = "goal";
export const MODE_COG = "cog";
export const MODE_SIGN = "sign";
export const MODE_SELECT = "select";
export const MODE_ENEMIES = "enemies";
export const MODE_WALLS_BUTTONS = "walls_and_buttons";
export const MODE_HELP = "help";

export class Editor {
	c: CanvasRenderingContext2D;
	worldScale: number;
	worldCenter: Vector;
	doc: Document;
	isMouseOver: boolean;
	selectedTool: Tool | null;
	activeTool: Tool | null;
	mode: string;
	selectedEnemy: number;
	selectedWall: number;

	constructor(c: CanvasRenderingContext2D) {
		this.c = c;
		this.worldScale = 50;
		this.worldCenter = new Vector(0, 0);
		this.doc = new Document();
		this.mode = "empty";
		this.selectedEnemy = 0;
		this.selectedWall = 0;
		this.isMouseOver = false;
		this.selectedTool = null;
		this.activeTool = null;

		// simple default level
		this.doc.world.playerStart = new Vector(-2, -1);
		this.doc.world.playerGoal = new Vector(1, -1);
		this.doc.world.setCell(-2, -1, CELL_EMPTY);
		this.doc.world.setCell(-2, 0, CELL_EMPTY);
		this.doc.world.setCell(-1, 0, CELL_EMPTY);
		this.doc.world.setCell(0, 0, CELL_EMPTY);
		this.doc.world.setCell(1, 0, CELL_EMPTY);
		this.doc.world.setCell(1, -1, CELL_EMPTY);
	}

	setMode(mode: string) {
		this.mode = mode;

		switch (mode) {
			case MODE_EMPTY:
				this.selectedTool = new SetCellTool(this.doc, SETCELL_EMPTY);
				break;
			case MODE_SOLID:
				this.selectedTool = new SetCellTool(this.doc, SETCELL_SOLID);
				break;
			case MODE_DIAGONAL:
				this.selectedTool = new SetCellTool(this.doc, SETCELL_DIAGONAL);
				break;
			case MODE_SELECT:
				this.selectedTool = new SelectionTool(this.doc);
				break;
			case MODE_START:
				this.selectedTool = new SetPlayerStartTool(this.doc);
				break;
			case MODE_GOAL:
				this.selectedTool = new SetPlayerGoalTool(this.doc);
				break;
			case MODE_COG:
				this.selectedTool = new AddPlaceableTool(
					this.doc,
					spriteTemplates[SPRITE_COG].sprite
				);
				break;
			case MODE_SIGN:
				this.selectedTool = new AddPlaceableTool(
					this.doc,
					spriteTemplates[SPRITE_SIGN].sprite
				);
				break;
			case MODE_ENEMIES:
			case MODE_WALLS_BUTTONS:
				this.setSidePanelTool();
				break;
			default:
				this.selectedTool = null;
				break;
		}
	}

	setSidePanelTool() {
		if (this.mode === MODE_ENEMIES) {
			this.selectedTool = new AddPlaceableTool(
				this.doc,
				enemies[this.selectedEnemy].sprite!
			);
		} else if (this.mode === MODE_WALLS_BUTTONS) {
			// TODO: constants for these
			if (this.selectedWall < 6) {
				this.selectedTool = new PlaceDoorTool(
					this.doc,
					Boolean(this.selectedWall & 1),
					false,
					Math.floor(this.selectedWall / 2) as 0 | 1 | 2
				);
			} else if (this.selectedWall < 9) {
				this.selectedTool = new AddPlaceableTool(
					this.doc,
					new Button(null, (this.selectedWall - 6) as 0 | 1 | 2)
				);
			} else if (this.selectedWall === 9) {
				this.selectedTool = new LinkButtonToDoorTool(this.doc);
			} else if (this.selectedWall === 10) {
				this.selectedTool = new ToggleInitiallyOpenTool(this.doc);
			} else {
				this.selectedTool = null;
			}
		}
	}

	draw() {
		const c = this.c;
		const w = this.c.canvas.width;
		const h = this.c.canvas.height;

		c.fillStyle = "#7F7F7F";
		c.fillRect(0, 0, w, h);

		c.save();

		// Set up camera transform (make sure the lines start off sharp by translating 0.5)
		c.translate(Math.round(w / 2) + 0.5, Math.round(h / 2) + 0.5);
		c.scale(this.worldScale, -this.worldScale);
		c.translate(-this.worldCenter.x, -this.worldCenter.y);
		c.lineWidth = 1 / this.worldScale;

		// Render the view
		this.doc.world.draw(c);
		this.drawGrid();

		// Let the tool draw overlays if needed
		if (this.isMouseOver && this.selectedTool !== null) {
			this.selectedTool.draw(c);
		}

		c.restore();
	}

	drawGrid() {
		// Blend away every other line as we zoom out
		const logWorldScale = Math.log(50 / this.worldScale) / Math.log(2);
		const currentResolution =
			logWorldScale < 1 ? 1 : 1 << Math.floor(logWorldScale);
		const nextResolution = 2 * currentResolution;
		const percent =
			logWorldScale < 0 ? 1 : 1 - logWorldScale + Math.floor(logWorldScale);

		// Work out which lines we have to draw
		const min = this.viewportToWorld(new Vector(0, this.c.canvas.height));
		const max = this.viewportToWorld(new Vector(this.c.canvas.width, 0));
		const minX = Math.floor(min.x / nextResolution) * nextResolution;
		const minY = Math.floor(min.y / nextResolution) * nextResolution;
		const maxX = Math.ceil(max.x / nextResolution) * nextResolution;
		const maxY = Math.ceil(max.y / nextResolution) * nextResolution;

		// Draw the solid
		this.c.strokeStyle = rgba(0, 0, 0, 0.2);
		this.c.beginPath();
		for (let x = minX; x <= maxX; x += 2 * currentResolution) {
			this.c.moveTo(x, minY);
			this.c.lineTo(x, maxY);
		}
		for (let y = minY; y <= maxY; y += 2 * currentResolution) {
			this.c.moveTo(minX, y);
			this.c.lineTo(maxX, y);
		}
		this.c.stroke();

		// Draw the fading lines
		this.c.strokeStyle = rgba(0, 0, 0, 0.2 * percent * percent);
		this.c.beginPath();
		for (
			let x = minX + currentResolution;
			x <= maxX;
			x += 2 * currentResolution
		) {
			this.c.moveTo(x, minY);
			this.c.lineTo(x, maxY);
		}
		for (
			let y = minY + currentResolution;
			y <= maxY;
			y += 2 * currentResolution
		) {
			this.c.moveTo(minX, y);
			this.c.lineTo(maxX, y);
		}
		this.c.stroke();
	}

	// Convenience method to convert from viewport to world coordinates
	viewportToWorld(viewportPoint: Vector) {
		const x =
			(viewportPoint.x - this.c.canvas.width / 2) / this.worldScale +
			this.worldCenter.x;
		const y =
			(this.c.canvas.height / 2 - viewportPoint.y) / this.worldScale +
			this.worldCenter.y;
		return new Vector(x, y);
	}

	mouseOver() {
		this.isMouseOver = true;
		this.draw();
	}

	mouseOut() {
		this.isMouseOver = false;
		this.draw();
	}

	resize() {
		this.draw();
	}

	mouseWheel(deltaX: number, deltaY: number, point: Vector) {
		// Scale the camera keeping the current view centered
		this.worldScale = Math.max(1, this.worldScale * Math.pow(1.1, deltaY));

		this.draw();
	}

	mouseDown(point: Vector, buttons: number) {
		if (buttons === MOUSE_MIDDLE || buttons === MOUSE_RIGHT) {
			// Camera pan on right click (or middle click because right click is broken in Safari)
			this.activeTool = new CameraPanTool(this.worldCenter);
			this.activeTool.mouseDown(this.viewportToWorld(point), this);
		} else if (buttons === MOUSE_LEFT) {
			// Use selected tool on left click
			this.activeTool = this.selectedTool;

			if (this.activeTool !== null) {
				// Need to clear macro stack here if we get a mousedown event without a mouseup event
				this.doc.undoStack.endAllMacros();
				this.activeTool.mouseDown(this.viewportToWorld(point), this);
			}
		}
		this.draw();
	}

	mouseMoved(point: Vector) {
		if (this.activeTool !== null) {
			this.activeTool.mouseMoved(this.viewportToWorld(point));
		}
		if (this.selectedTool !== null) {
			this.selectedTool.mouseMoved(this.viewportToWorld(point));
		}
		this.draw();
	}

	mouseUp(point: Vector) {
		if (this.activeTool !== null) {
			this.activeTool.mouseUp(this.viewportToWorld(point));
		}
		this.activeTool = null;
		this.draw();
	}

	doubleClick(point: Vector) {
		const worldPoint = this.viewportToWorld(point);
		const selection = this.doc.world.selectionInRect(
			new Rectangle(worldPoint, worldPoint)
		);
		if (
			selection.length === 1 &&
			selection[0] instanceof Sprite &&
			selection[0].id === SPRITE_SIGN
		) {
			this.doc.setSelection(selection);
			this.draw();
			const text = prompt("Text");
			if (text !== null) {
				this.doc.setSignText(selection[0], text);
				this.draw();
			}
		}
	}

	undo() {
		this.doc.undoStack.undo();
		this.draw();
	}

	redo() {
		this.doc.undoStack.redo();
		this.draw();
	}

	deleteSeleciton() {
		const selection = this.doc.world.getSelection();
		this.doc.undoStack.beginMacro();
		for (let i = 0; i < selection.length; i++) {
			this.doc.removePlaceable(selection[i]);
		}
		this.doc.undoStack.endMacro();
		this.draw();
	}

	selectAll() {
		const selection: BasePlaceable[] = [];
		const placeables = this.doc.world.placeables;
		for (let i = 0; i < placeables.length; i++) {
			selection.push(placeables[i]);
		}
		this.doc.setSelection(selection);
		this.draw();
	}

	setSelectedEnemy(index: number) {
		this.selectedEnemy = index;
		this.setSidePanelTool();
	}

	setSelectedWall(index: number) {
		this.selectedWall = index;
		this.setSidePanelTool();
	}

	toJSON() {
		return this.doc.world.toJSON();
	}

	fromJSON(level: LevelData) {
		this.doc.world.fromJSON(level);
	}
}
