import { LevelData } from "../../schemas.js";
import { CELL_SOLID, COLOR_NEUTRAL } from "../constants.js";
import { rgba } from "../utils.js";
import { Vector } from "../vector.js";
import { Button } from "./placeables/button.js";
import { BasePlaceable, PlaceableType } from "./placeables/placeable.js";
import {
	SPRITE_BOMBER,
	SPRITE_BOUNCY_ROCKET_LAUNCHER,
	SPRITE_COG,
	SPRITE_CORROSION_CLOUD,
	SPRITE_DOOM_MAGNET,
	SPRITE_GRENADIER,
	SPRITE_HEADACHE,
	SPRITE_HUNTER,
	SPRITE_JET_STREAM,
	SPRITE_MULTI_GUN,
	SPRITE_POPPER,
	SPRITE_ROCKET_SPIDER,
	SPRITE_SHOCK_HAWK,
	SPRITE_SIGN,
	SPRITE_SPIKE_BALL,
	SPRITE_STALACBAT,
	SPRITE_WALL_AVOIDER,
	SPRITE_WALL_CRAWLER,
	SPRITE_WHEELIGATOR,
	Sprite,
	spriteTemplates,
} from "./placeables/sprite.js";
import { SECTOR_SIZE, Sector } from "./sector.js";
import { Rectangle } from "./shapes.js";
import { drawGoal, drawSpawnPoint } from "./sprites.js";
import { Door } from "./placeables/door.js";
import { Link } from "./placeables/link.js";
import { Edge } from "./edge.js";

const enemyToSpriteMap = {
	bomber: SPRITE_BOMBER,
	"doom magnet": SPRITE_DOOM_MAGNET,
	grenadier: SPRITE_GRENADIER,
	headache: SPRITE_HEADACHE,
	popper: SPRITE_POPPER,
	"jet stream": SPRITE_JET_STREAM,
	"shock hawk": SPRITE_SHOCK_HAWK,
	stalacbat: SPRITE_STALACBAT,
	"wall crawler": SPRITE_WALL_CRAWLER,
	wheeligator: SPRITE_WHEELIGATOR,
	"rocket spider": SPRITE_ROCKET_SPIDER,
	hunter: SPRITE_HUNTER,
	"wall avoider": SPRITE_WALL_AVOIDER,
	"spike ball": SPRITE_SPIKE_BALL,
	"corrosion cloud": SPRITE_CORROSION_CLOUD,
	"bouncy rocket launcher": SPRITE_BOUNCY_ROCKET_LAUNCHER,
	"multi gun": SPRITE_MULTI_GUN,
};

function spriteTypeFromId(id: number) {
	let key: keyof typeof enemyToSpriteMap;
	for (key in enemyToSpriteMap) {
		if (Object.prototype.hasOwnProperty.call(enemyToSpriteMap, key)) {
			const spriteId = enemyToSpriteMap[key];
			if (spriteId === id) {
				return key;
			}
		}
	}
	throw new Error("Invalid sprite id");
}

function indicesOfLinkedDoors(button: Button, world: World) {
	// find all links linking to button
	const links: Link[] = [];
	for (let i = 0; i < world.placeables.length; i++) {
		const link = world.placeables[i];
		if (link instanceof Link && link.button === button) {
			links.push(link);
		}
	}

	// find the indices of the door in each link
	const indices = [];
	for (let i = 0; i < links.length; i++) {
		const link = links[i];
		let index = 0;
		for (let j = 0; j < world.placeables.length; j++) {
			const door = world.placeables[j];
			if (door instanceof Door) {
				if (door === link.door) {
					indices.push(index);
					break;
				}
				index++;
			}
		}
	}

	return indices.sort();
}

export class World {
	offset: Vector;
	size: Vector;
	sectors: Sector[];
	placeables: BasePlaceable[];
	playerStart: Vector;
	playerGoal: Vector;

	constructor() {
		this.offset = new Vector(0, 0); // This is in sectors, not cells
		this.size = new Vector(0, 0); // This is in sectors, not cells
		this.sectors = [];
		this.placeables = [];
		this.playerStart = new Vector(0, 0);
		this.playerGoal = new Vector(0, 0);
	}

	draw(c: CanvasRenderingContext2D) {
		let x;
		let y;
		let i;

		// Draw the level itself
		c.strokeStyle = "#BFBFBF";
		c.fillStyle = "#BFBFBF";
		for (y = 0, i = 0; y < this.size.y; y++) {
			for (x = 0; x < this.size.x; x++, i++) {
				this.sectors[i].draw(c);
			}
		}

		drawGoal(c, 1, this.playerGoal.add(new Vector(0.5, 0.5)), 0.6);
		drawSpawnPoint(c, 1, this.playerStart.add(new Vector(0.5, 0.5)));

		// Draw placeables (doors, enemies, etc...)
		for (i = 0; i < this.placeables.length; i++) {
			this.placeables[i].draw(c, 1);
		}

		// Draw selections around selected placeables
		c.fillStyle = rgba(0, 0, 0, 0.1);
		c.strokeStyle = rgba(0, 0, 0, 0.5);
		for (i = 0; i < this.placeables.length; i++) {
			if (this.placeables[i].selected) {
				this.placeables[i].drawSelection(c);
			}
		}
	}

	containsSectorPoint(sectorX: number, sectorY: number) {
		return (
			sectorX >= this.offset.x &&
			sectorX < this.offset.x + this.size.x &&
			sectorY >= this.offset.y &&
			sectorY < this.offset.y + this.size.y
		);
	}

	getCell(x: number, y: number) {
		const sectorX = Math.floor(x / SECTOR_SIZE);
		const sectorY = Math.floor(y / SECTOR_SIZE);

		if (this.containsSectorPoint(sectorX, sectorY)) {
			return this.sectors[
				sectorX - this.offset.x + (sectorY - this.offset.y) * this.size.x
			].getCell(x, y);
		} else {
			return CELL_SOLID;
		}
	}

	setCell(x: number, y: number, type: 0 | 1 | 2 | 3 | 4 | 5) {
		const sectorX = Math.floor(x / SECTOR_SIZE);
		const sectorY = Math.floor(y / SECTOR_SIZE);

		// Make sure the sector under the cell at (x, y) exists
		if (this.sectors.length === 0) {
			// Create the first sector
			this.sectors.push(new Sector(sectorX, sectorY));
			this.offset = new Vector(sectorX, sectorY);
			this.size = new Vector(1, 1);
		} else if (!this.containsSectorPoint(sectorX, sectorY)) {
			// Save the old sectors
			const oldOffset = this.offset;
			const oldSize = this.size;
			const oldSectors = this.sectors;

			// Create a new range of sectors that includes the old ones and the new one
			this.offset = new Vector(
				Math.min(sectorX, oldOffset.x),
				Math.min(sectorY, oldOffset.y)
			);
			this.size = new Vector(
				Math.max(
					sectorX - oldOffset.x + 1,
					oldSize.x + (oldOffset.x - this.offset.x)
				),
				Math.max(
					sectorY - oldOffset.y + 1,
					oldSize.y + (oldOffset.y - this.offset.y)
				)
			);
			this.sectors = new Array(this.size.x * this.size.y);

			// Fill in the new sectors from the old sectors
			for (let dy = 0, i = 0; dy < this.size.y; dy++) {
				const oldY = this.offset.y + dy - oldOffset.y;
				for (let dx = 0; dx < this.size.x; dx++, i++) {
					const oldX = this.offset.x + dx - oldOffset.x;
					if (oldX >= 0 && oldY >= 0 && oldX < oldSize.x && oldY < oldSize.y) {
						this.sectors[i] = oldSectors[oldX + oldY * oldSize.x];
					} else {
						this.sectors[i] = new Sector(
							this.offset.x + dx,
							this.offset.y + dy
						);
					}
				}
			}
		}

		this.sectors[
			sectorX - this.offset.x + (sectorY - this.offset.y) * this.size.x
		].setCell(x, y, type);
	}

	addPlaceable(placeable: BasePlaceable) {
		this.placeables.push(placeable);
	}

	removePlaceable(placeable: BasePlaceable) {
		for (let i = 0; i < this.placeables.length; i++) {
			if (this.placeables[i] === placeable) {
				this.placeables.splice(i--, 1);
			}
		}
	}

	closestPlaceableOfType<T extends BasePlaceable>(
		point: Vector,
		type: PlaceableType
	) {
		let minDist = Number.MAX_VALUE;
		let placeable = null;
		for (let i = 0; i < this.placeables.length; i++) {
			const p = this.placeables[i];
			if (p.placeableType !== type) {
				continue;
			}
			const dist = p.getCenter()!.sub(point).length();
			if (dist < minDist) {
				placeable = p;
				minDist = dist;
			}
		}
		return placeable as T;
	}

	getSelection() {
		const selection = [];
		for (let i = 0; i < this.placeables.length; i++) {
			if (this.placeables[i].selected) {
				selection.push(this.placeables[i]);
			}
		}
		return selection;
	}

	selectionInRect(rect: Rectangle) {
		const selection = [];
		for (let i = 0; i < this.placeables.length; i++) {
			if (this.placeables[i].touchesRect(rect)) {
				selection.push(this.placeables[i]);
			}
		}
		return selection;
	}

	setSelection(selection: BasePlaceable[]) {
		for (let i = 0; i < this.placeables.length; i++) {
			const p = this.placeables[i];
			p.selected = false;
			for (let j = 0; j < selection.length; j++) {
				if (selection[j] === p) {
					p.selected = true;
					break;
				}
			}
		}
	}

	toJSON(): LevelData {
		// values are quoted (like json['width'] instead of json.width) so closure compiler doesn't touch them

		// fit a bounding box around all non-blank cells
		let min = new Vector(Number.MAX_VALUE, Number.MAX_VALUE);
		let max = new Vector(-Number.MAX_VALUE, -Number.MAX_VALUE);
		for (let i = 0; i < this.sectors.length; i++) {
			const sector = this.sectors[i];
			for (let y = 0; y < SECTOR_SIZE; y++) {
				const sy = sector.offset.y * SECTOR_SIZE + y;
				for (let x = 0; x < SECTOR_SIZE; x++) {
					const sx = sector.offset.x * SECTOR_SIZE + x;
					if (sector.cells[x + y * SECTOR_SIZE].type !== CELL_SOLID) {
						min = min.minComponents(new Vector(sx, sy));
						max = max.maxComponents(new Vector(sx + 1, sy + 1));
					}
				}
			}
		}

		// center empty levels at the origin
		if (min.x === Number.MAX_VALUE) {
			min.x = min.y = max.x = max.y = 0;
		}

		const width = max.x - min.x;
		const height = max.y - min.y;

		const cells: LevelData["cells"] = [];
		for (let y = min.y; y < max.y; y++) {
			const row: ReturnType<typeof this.getCell>[] = [];
			for (let x = min.x; x < max.x; x++) {
				row.push(this.getCell(x, y));
			}
			cells.push(row);
		}

		// save entities
		const entities: LevelData["entities"] = [];
		for (let i = 0; i < this.placeables.length; i++) {
			const p = this.placeables[i];
			if (p instanceof Button) {
				entities.push({
					class: "button",
					type: p.type,
					pos: Vector.toTuple(p.anchor!.sub(min)),
					walls: indicesOfLinkedDoors(p, this),
				});
			} else if (p instanceof Door) {
				entities.push({
					class: "wall",
					oneway: !!p.isOneWay,
					open: !!p.isInitiallyOpen,
					start: Vector.toTuple(p.edge.start.sub(min)),
					end: Vector.toTuple(p.edge.end.sub(min)),
					color: p.color,
				});
			} else if (p instanceof Sprite && p.id === SPRITE_COG) {
				entities.push({
					class: "cog",
					pos: Vector.toTuple(p.anchor!.sub(min)),
				});
			} else if (p instanceof Sprite && p.id === SPRITE_SIGN) {
				entities.push({
					class: "sign",
					pos: Vector.toTuple(p.anchor!.sub(min)),
					text: p.text,
				});
			} else if (p instanceof Sprite) {
				entities.push({
					class: "enemy",
					type: spriteTypeFromId(p.id),
					pos: Vector.toTuple(p.anchor!.sub(min)),
					color: p.color,
					angle: p.angle - Math.floor(p.angle / (2 * Math.PI)) * (2 * Math.PI), // 0 <= angle < 2PI
				});
			}
		}

		// save per-level stuff
		const uniqueId = Math.round(Math.random() * 0xffffffff);
		const start = Vector.toTuple(this.playerStart.sub(min));
		const end = Vector.toTuple(this.playerGoal.sub(min));

		return { cells, width, height, start, end, entities, unique_id: uniqueId };
	}

	fromJSON(json: LevelData) {
		this.playerStart = Vector.fromTuple(json.start);
		this.playerGoal = Vector.fromTuple(json.end);

		this.size = new Vector(
			Math.ceil(json.width / SECTOR_SIZE),
			Math.ceil(json.height / SECTOR_SIZE)
		);
		this.sectors = [];
		for (let x = 0; x < json.width; x++) {
			for (let y = 0; y < json.height; y++) {
				this.setCell(x, y, json.cells[y][x]);
			}
		}

		// load entities
		const walls: Door[] = [];
		const buttons = [];
		this.placeables = [];
		const buttonWalls: Record<number, number[]> = {};

		for (let i = 0; i < json.entities.length; i++) {
			const e = json.entities[i];
			switch (e.class) {
				case "cog":
					this.placeables.push(
						spriteTemplates[SPRITE_COG].sprite.clone(Vector.fromTuple(e.pos))
					);
					break;

				case "wall": {
					const wall = new Door(
						e.oneway,
						e.open,
						e.color,
						new Edge(Vector.fromTuple(e.start), Vector.fromTuple(e.end))
					);
					walls.push(wall);
					this.placeables.push(wall);
					break;
				}

				case "button": {
					const button = new Button(Vector.fromTuple(e.pos), e["type"]);
					buttons.push(button);
					buttonWalls[buttons.length - 1] = e.walls;
					this.placeables.push(button);
					break;
				}

				case "sign": {
					const sign = spriteTemplates[SPRITE_SIGN].sprite.clone(
						Vector.fromTuple(e["pos"]),
						COLOR_NEUTRAL,
						0
					);
					sign.text = e["text"];
					this.placeables.push(sign);
					break;
				}

				case "enemy":
					this.placeables.push(
						spriteTemplates[enemyToSpriteMap[e.type]].sprite.clone(
							Vector.fromTuple(e["pos"]),
							e["color"],
							e["angle"]
						)
					);
					break;
			}
		}

		// link buttons to doors
		for (let i = 0; i < buttons.length; i++) {
			const button = buttons[i];
			const bWalls = buttonWalls[i];
			for (let j = 0; j < bWalls.length; j++) {
				this.placeables.push(new Link(walls[bWalls[j]], button));
			}
		}
	}
}
