import {
	CELL_SOLID,
	CELL_EMPTY,
	CELL_CEIL_DIAG_LEFT,
	CELL_CEIL_DIAG_RIGHT,
	CELL_FLOOR_DIAG_LEFT,
	CELL_FLOOR_DIAG_RIGHT,
} from "../constants";

export class Cell {
	type: 0 | 1 | 2 | 3 | 4 | 5;
	edges: [boolean, boolean, boolean, boolean, boolean];

	constructor() {
		this.type = CELL_SOLID;
		this.edges = [false, false, false, false, false];
	}

	draw(c: CanvasRenderingContext2D, x: number, y: number) {
		switch (this.type) {
			case CELL_EMPTY:
				c.strokeRect(x, y, 1, 1);
				c.fillRect(x, y, 1, 1);
				break;
			case CELL_CEIL_DIAG_LEFT:
				c.beginPath();
				c.moveTo(x, y);
				c.lineTo(x + 1, y);
				c.lineTo(x + 1, y + 1);
				c.stroke();
				c.fill();
				break;
			case CELL_CEIL_DIAG_RIGHT:
				c.beginPath();
				c.moveTo(x, y);
				c.lineTo(x + 1, y);
				c.lineTo(x, y + 1);
				c.stroke();
				c.fill();
				break;
			case CELL_FLOOR_DIAG_LEFT:
				c.beginPath();
				c.moveTo(x + 1, y);
				c.lineTo(x + 1, y + 1);
				c.lineTo(x, y + 1);
				c.stroke();
				c.fill();
				break;
			case CELL_FLOOR_DIAG_RIGHT:
				c.beginPath();
				c.moveTo(x, y);
				c.lineTo(x + 1, y + 1);
				c.lineTo(x, y + 1);
				c.stroke();
				c.fill();
				break;
		}
	}

	flipType() {
		switch (this.type) {
			case CELL_EMPTY:
				this.type = CELL_SOLID;
				break;
			case CELL_SOLID:
				this.type = CELL_EMPTY;
				break;
			case CELL_CEIL_DIAG_LEFT:
				this.type = CELL_FLOOR_DIAG_RIGHT;
				break;
			case CELL_CEIL_DIAG_RIGHT:
				this.type = CELL_FLOOR_DIAG_LEFT;
				break;
			case CELL_FLOOR_DIAG_LEFT:
				this.type = CELL_CEIL_DIAG_RIGHT;
				break;
			case CELL_FLOOR_DIAG_RIGHT:
				this.type = CELL_CEIL_DIAG_LEFT;
				break;
		}
	}
}
