import { CELL_SOLID } from "../constants.js";
import { Vector } from "../vector.js";
import { Cell } from "./cell.js";

export const SECTOR_SIZE = 8;

export class Sector {
	offset: Vector;
	cells: Cell[];

	constructor(offsetX: number, offsetY: number) {
		this.offset = new Vector(offsetX, offsetY); // This is in sectors, not cells
		this.cells = new Array(SECTOR_SIZE * SECTOR_SIZE);
		for (let cell = 0; cell < SECTOR_SIZE * SECTOR_SIZE; cell++) {
			this.cells[cell] = new Cell();
		}
	}

	draw(c: CanvasRenderingContext2D) {
		const offsetX = this.offset.x * SECTOR_SIZE;
		const offsetY = this.offset.y * SECTOR_SIZE;
		for (let y = 0, i = 0; y < SECTOR_SIZE; y++) {
			for (let x = 0; x < SECTOR_SIZE; x++, i++) {
				this.cells[i].draw(c, offsetX + x, offsetY + y);
			}
		}
	}

	isSolid() {
		for (let cell = 0; cell < SECTOR_SIZE * SECTOR_SIZE; cell++) {
			if (this.cells[cell].type !== CELL_SOLID) {
				return false;
			}
		}
		return true;
	}

	getCell(x: number, y: number) {
		x -= this.offset.x * SECTOR_SIZE;
		y -= this.offset.y * SECTOR_SIZE;
		return this.cells[x + y * SECTOR_SIZE].type;
	}

	setCell(x: number, y: number, type: 0 | 1 | 2 | 3 | 4 | 5) {
		x -= this.offset.x * SECTOR_SIZE;
		y -= this.offset.y * SECTOR_SIZE;
		this.cells[x + y * SECTOR_SIZE].type = type;
	}
}
