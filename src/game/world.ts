import { AABB } from "./aabb.js";
import { Cell } from "./cell.js";
import {
	CELL_SOLID,
	CELL_EMPTY,
	CELL_FLOOR_DIAG_RIGHT,
	CELL_CEIL_DIAG_RIGHT,
	CELL_CEIL_DIAG_LEFT,
	CELL_FLOOR_DIAG_LEFT,
	EDGE_NEUTRAL,
} from "./constants.js";
import { Edge } from "./edge.js";
import { Vector } from "./vector.js";

const WORLD_MARGIN = 60;

// is this side of the cell empty?
function IS_EMPTY_XNEG(type: number) {
	return (
		type === CELL_EMPTY ||
		type === CELL_FLOOR_DIAG_RIGHT ||
		type === CELL_CEIL_DIAG_RIGHT
	);
}
function IS_EMPTY_YNEG(type: number) {
	return (
		type === CELL_EMPTY ||
		type === CELL_CEIL_DIAG_LEFT ||
		type === CELL_CEIL_DIAG_RIGHT
	);
}
function IS_EMPTY_XPOS(type: number) {
	return (
		type === CELL_EMPTY ||
		type === CELL_FLOOR_DIAG_LEFT ||
		type === CELL_CEIL_DIAG_LEFT
	);
}
function IS_EMPTY_YPOS(type: number) {
	return (
		type === CELL_EMPTY ||
		type === CELL_FLOOR_DIAG_LEFT ||
		type === CELL_FLOOR_DIAG_RIGHT
	);
}

// is this side of the cell solid?
function IS_SOLID_XNEG(type: number) {
	return (
		type === CELL_SOLID ||
		type === CELL_FLOOR_DIAG_LEFT ||
		type === CELL_CEIL_DIAG_LEFT
	);
}
function IS_SOLID_YNEG(type: number) {
	return (
		type === CELL_SOLID ||
		type === CELL_FLOOR_DIAG_LEFT ||
		type === CELL_FLOOR_DIAG_RIGHT
	);
}
function IS_SOLID_XPOS(type: number) {
	return (
		type === CELL_SOLID ||
		type === CELL_FLOOR_DIAG_RIGHT ||
		type === CELL_CEIL_DIAG_RIGHT
	);
}
function IS_SOLID_YPOS(type: number) {
	return (
		type === CELL_SOLID ||
		type === CELL_CEIL_DIAG_LEFT ||
		type === CELL_CEIL_DIAG_RIGHT
	);
}

function rect(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number
) {
	c.fillRect(x, y, w, h);
	c.strokeRect(x, y, w, h);
}

export class World {
	cells: Cell[][];
	width: number;
	height: number;
	safety: Vector;
	spawnPoint: Vector;
	goal: Vector;

	constructor(width: number, height: number, spawnPoint: Vector, goal: Vector) {
		this.cells = new Array<Cell[]>(width);
		for (let x = 0; x < width; ++x) {
			this.cells[x] = new Array<Cell>(height);
			for (let y = 0; y < height; ++y) {
				this.cells[x][y] = new Cell(x, y, CELL_SOLID);
			}
		}

		this.width = width;
		this.height = height;
		this.safety = spawnPoint;

		this.spawnPoint = spawnPoint.add(new Vector(0.5, 0.5));
		this.goal = goal.add(new Vector(0.5, 0.5));
	}

	drawBorder(
		c: CanvasRenderingContext2D,
		xmin: number,
		ymin: number,
		xmax: number,
		ymax: number
	) {
		const padding = 100;
		if (xmin < 0) {
			rect(c, -padding, 0, padding, this.height);
		}
		if (ymin < 0) {
			rect(c, -padding, -padding, this.width + 2 * padding, padding);
		}
		if (xmax > this.width) {
			rect(c, this.width, 0, padding, this.height);
		}
		if (ymax > this.height) {
			rect(c, -padding, this.height, this.width + 2 * padding, padding);
		}
	}

	draw(
		c: CanvasRenderingContext2D,
		xmin: number,
		ymin: number,
		xmax: number,
		ymax: number
	) {
		c.fillStyle = "#7F7F7F";
		c.strokeStyle = "#7F7F7F";

		this.drawBorder(c, xmin, ymin, xmax, ymax);

		xmin = Math.max(0, Math.floor(xmin));
		ymin = Math.max(0, Math.floor(ymin));
		xmax = Math.min(this.width, Math.ceil(xmax));
		ymax = Math.min(this.height, Math.ceil(ymax));

		for (let x = xmin; x < xmax; x++) {
			for (let y = ymin; y < ymax; y++) {
				this.cells[x][y].draw(c);
			}
		}

		c.strokeStyle = "black";
		for (let x = xmin; x < xmax; x++) {
			for (let y = ymin; y < ymax; y++) {
				this.cells[x][y].drawEdges(c);
			}
		}
	}

	// cells outside the world return null
	getCell(x: number, y: number) {
		return x >= 0 && y >= 0 && x < this.width && y < this.height
			? this.cells[x][y]
			: null;
	}

	// cells outside the world return solid
	getCellType(x: number, y: number) {
		return x >= 0 && y >= 0 && x < this.width && y < this.height
			? this.cells[x][y].type
			: CELL_SOLID;
	}

	setCell(x: number, y: number, type: number) {
		this.cells[x][y] = new Cell(x, y, type);
	}

	createAllEdges() {
		for (let x = 0; x < this.cells.length; x++) {
			for (let y = 0; y < this.cells[0].length; y++) {
				this.cells[x][y].edges = this.createEdges(x, y);
			}
		}
	}

	createEdges(x: number, y: number) {
		const edges = [];

		const cellType = this.getCellType(x, y);
		const cellTypeXneg = this.getCellType(x - 1, y);
		const cellTypeYneg = this.getCellType(x, y - 1);
		const cellTypeXpos = this.getCellType(x + 1, y);
		const cellTypeYpos = this.getCellType(x, y + 1);

		const lowerLeft = new Vector(x, y);
		const lowerRight = new Vector(x + 1, y);
		const upperLeft = new Vector(x, y + 1);
		const upperRight = new Vector(x + 1, y + 1);

		// add horizontal and vertical edges
		if (IS_EMPTY_XNEG(cellType) && IS_SOLID_XPOS(cellTypeXneg)) {
			edges.push(new Edge(lowerLeft, upperLeft, EDGE_NEUTRAL));
		}
		if (IS_EMPTY_YNEG(cellType) && IS_SOLID_YPOS(cellTypeYneg)) {
			edges.push(new Edge(lowerRight, lowerLeft, EDGE_NEUTRAL));
		}
		if (IS_EMPTY_XPOS(cellType) && IS_SOLID_XNEG(cellTypeXpos)) {
			edges.push(new Edge(upperRight, lowerRight, EDGE_NEUTRAL));
		}
		if (IS_EMPTY_YPOS(cellType) && IS_SOLID_YNEG(cellTypeYpos)) {
			edges.push(new Edge(upperLeft, upperRight, EDGE_NEUTRAL));
		}

		// add diagonal edges
		if (cellType === CELL_FLOOR_DIAG_RIGHT) {
			edges.push(new Edge(upperRight, lowerLeft, EDGE_NEUTRAL));
		} else if (cellType === CELL_CEIL_DIAG_LEFT) {
			edges.push(new Edge(lowerLeft, upperRight, EDGE_NEUTRAL));
		} else if (cellType === CELL_FLOOR_DIAG_LEFT) {
			edges.push(new Edge(lowerRight, upperLeft, EDGE_NEUTRAL));
		} else if (cellType === CELL_CEIL_DIAG_RIGHT) {
			edges.push(new Edge(upperLeft, lowerRight, EDGE_NEUTRAL));
		}

		return edges;
	}

	getEdgesInAabb(aabb: AABB, color: number) {
		const xmin = Math.max(0, Math.floor(aabb.getLeft()));
		const ymin = Math.max(0, Math.floor(aabb.getBottom()));
		const xmax = Math.min(this.width, Math.ceil(aabb.getRight()));
		const ymax = Math.min(this.height, Math.ceil(aabb.getTop()));
		const edges: Edge[] = [];

		for (let x = xmin; x < xmax; x++) {
			for (let y = ymin; y < ymax; y++) {
				edges.push(...this.cells[x][y].getBlockingEdges(color));
			}
		}

		return edges;
	}

	getCellsInAabb(aabb: AABB) {
		const xmin = Math.max(0, Math.floor(aabb.getLeft()));
		const ymin = Math.max(0, Math.floor(aabb.getBottom()));
		const xmax = Math.min(this.width, Math.ceil(aabb.getRight()));
		const ymax = Math.min(this.height, Math.ceil(aabb.getTop()));
		const cells: Cell[] = [];

		for (let x = xmin; x < xmax; x++) {
			for (let y = ymin; y < ymax; y++) {
				cells.push(this.cells[x][y]);
			}
		}

		return cells;
	}

	getHugeAabb() {
		return new AABB(
			new Vector(-WORLD_MARGIN, -WORLD_MARGIN),
			new Vector(this.width + WORLD_MARGIN, this.height + WORLD_MARGIN)
		);
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}
}
