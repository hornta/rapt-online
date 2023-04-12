import { LevelData } from "../schemas";
import {
	collideEntityWorld,
	intersectEntitySegment,
} from "./collisionDetection";
import {
	EDGE_RED,
	EDGE_BLUE,
	GAME_IN_PLAY,
	GAME_LOST,
	GAME_WON,
	ONE_WAY,
	DOORBELL_CLOSE,
	SPAWN_POINT_PARTICLE_FREQ,
	CELL_SOLID,
	TWO_WAY,
} from "./constants";
import { Door } from "./door";
import { Doorbell } from "./doorbell";
import { Edge } from "./edge";
import { Enemy } from "./enemy";
import { GoldenCog } from "./goldenCog";
import { HelpSign } from "./helpSign";
import { createDoor, createEnemy } from "./levelLoader";
import { randInRange } from "./math";
import { Particle } from "./particle";
import { Player } from "./player";
import { Vector } from "./vector";
import { World } from "./world";

function drawSpawnPoint(c: CanvasRenderingContext2D, point: Vector) {
	c.strokeStyle = c.fillStyle = "rgba(255, 255, 255, 0.1)";
	c.beginPath();
	c.arc(point.x, point.y, 1, 0, 2 * Math.PI, false);
	c.stroke();
	c.fill();

	const gradient = c.createLinearGradient(0, point.y - 0.4, 0, point.y + 0.6);
	gradient.addColorStop(0, "rgba(255, 255, 255, 0.75)");
	gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
	c.fillStyle = gradient;
	c.beginPath();
	c.lineTo(point.x - 0.35, point.y + 0.6);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.35, point.y + 0.6);
	c.fill();

	c.fillStyle = "black";
	c.beginPath();
	c.moveTo(point.x - 0.1, point.y - 0.45);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.45);
	c.arc(point.x, point.y - 0.45, 0.2, 0, Math.PI, true);
	c.fill();
}

function drawGoal(c: CanvasRenderingContext2D, point: Vector, time: number) {
	let percent = time - Math.floor(time);
	percent = 1 - percent;
	percent = (percent - Math.pow(percent, 6)) * 1.72;
	percent = 1 - percent;

	c.fillStyle = "black";
	for (let i = 0; i < 4; ++i) {
		const angle = i * ((2 * Math.PI) / 4);
		const s = Math.sin(angle);
		const csn = Math.cos(angle);
		const radius = 0.45 - percent * 0.25;
		const size = 0.15;
		c.beginPath();
		c.moveTo(
			point.x + csn * radius - s * size,
			point.y + s * radius + csn * size
		);
		c.lineTo(
			point.x + csn * radius + s * size,
			point.y + s * radius - csn * size
		);
		c.lineTo(point.x + csn * (radius - size), point.y + s * (radius - size));
		c.fill();
	}
}

export class GameState {
	world: World;
	playerA: Player;
	playerB: Player;
	spawnPointParticleTimer: number;
	spawnPointOffset: Vector;
	enemies: Enemy[];
	doors: Door[];
	timeSinceStart: number;
	killKey: boolean;
	modificationCount: number;
	stats: [number, number, number, number];
	gameStatus: number;

	constructor() {
		this.world = new World(50, 50, new Vector(0.5, 0.5), new Vector(0.5, 0.5));
		this.playerA = new Player(this.world.spawnPoint, EDGE_RED);
		this.playerB = new Player(this.world.spawnPoint, EDGE_BLUE);
		this.spawnPointParticleTimer = 0;
		this.spawnPointOffset = new Vector(0, 0);
		this.enemies = [];
		this.doors = [];
		this.timeSinceStart = 0;

		// keys (will be set automatically)
		this.killKey = false;

		// if you need to tell if the world has been modified (door has been opened/closed), just watch
		// for changes to this variable, which can be incremented by gameState.recordModification()
		this.modificationCount = 0;

		this.gameStatus = GAME_IN_PLAY;
		this.stats = [0, 0, 0, 0];
	}

	recordModification() {
		this.modificationCount++;
	}

	getPlayer(i: number) {
		return i === 0 ? this.playerA : this.playerB;
	}

	getOtherPlayer(player: Player) {
		return player === this.playerA ? this.playerB : this.playerA;
	}

	getSpawnPoint() {
		return this.world.spawnPoint;
	}

	setSpawnPoint(point: Vector) {
		this.world.spawnPoint = new Vector(point.x, point.y);

		// offset to keep spawn point from drawing below ground
		this.spawnPointOffset.y = 0.125;

		// prevents slipping?
		this.world.spawnPoint.y += 0.01;
	}

	gameWon() {
		const goal = this.world.goal;
		const atGoalA =
			!this.playerA.isDead &&
			Math.abs(this.playerA.getCenter().x - goal.x) < 0.4 &&
			Math.abs(this.playerA.getCenter().y - goal.y) < 0.4;
		const atGoalB =
			!this.playerB.isDead &&
			Math.abs(this.playerB.getCenter().x - goal.x) < 0.4 &&
			Math.abs(this.playerB.getCenter().y - goal.y) < 0.4;
		return atGoalA && atGoalB;
	}

	gameLost() {
		return this.playerA.isDead && this.playerB.isDead;
	}

	incrementStat(stat: 0 | 1 | 2 | 3) {
		++this.stats[stat];
	}

	addEnemy(enemy: Enemy, spawnerPosition: Vector) {
		// If adding at the start of the game, start at its own center
		if (typeof spawnerPosition === "undefined") {
			spawnerPosition = enemy.getShape().getCenter();
		} else {
			// rewind the enemy back to the spawner's center
			enemy.getShape().moveTo(spawnerPosition);
		}

		const ref_deltaPosition = {
			ref: enemy.getShape().getCenter().sub(spawnerPosition),
		};
		const ref_velocity = { ref: enemy.getVelocity() };

		// do collision detection and push the enemy backwards if it would hit any walls
		collideEntityWorld(
			enemy,
			ref_deltaPosition,
			ref_velocity,
			enemy.getElasticity(),
			this.world,
			true
		);

		// put the velocity back into the enemy
		enemy.setVelocity(ref_velocity.ref);

		// move the spawned enemy as far out from the spawner as we can
		enemy.getShape().moveBy(ref_deltaPosition.ref);

		// now we can add the enemy to the list
		this.enemies.push(enemy);
	}

	clearDoors() {
		this.doors = [];
	}

	addDoor(
		start: Vector,
		end: Vector,
		type: number,
		color: number,
		startsOpen: boolean
	) {
		let cell1;
		let cell2;
		let valid = true;
		// left wall
		if (start.y + 1 === end.y && start.x === end.x) {
			cell1 = this.world.getCell(start.x, start.y);
			cell2 = this.world.getCell(start.x - 1, start.y);
			if (
				!cell1 ||
				!cell2 ||
				cell1.leftWallOccupied() ||
				cell2.rightWallOccupied()
			) {
				valid = false;
			}
		}
		// right wall
		else if (start.y - 1 === end.y && start.x === end.x) {
			cell1 = this.world.getCell(start.x - 1, end.y);
			cell2 = this.world.getCell(start.x, end.y);
			if (
				!cell1 ||
				!cell2 ||
				cell1.rightWallOccupied() ||
				cell2.leftWallOccupied()
			) {
				valid = false;
			}
		}
		// ceiling
		else if (start.x + 1 === end.x && start.y === end.y) {
			cell1 = this.world.getCell(start.x, start.y - 1);
			cell2 = this.world.getCell(start.x, start.y);
			if (
				!cell1 ||
				!cell2 ||
				cell1.ceilingOccupied() ||
				cell2.floorOccupied()
			) {
				valid = false;
			}
		}
		// floor
		else if (start.x - 1 === end.x && start.y === end.y) {
			cell1 = this.world.getCell(end.x, start.y);
			cell2 = this.world.getCell(end.x, start.y - 1);
			if (
				!cell1 ||
				!cell2 ||
				cell1.floorOccupied() ||
				cell2.ceilingOccupied()
			) {
				valid = false;
			}
		}
		//diagonal
		else {
			const x = start.x < end.x ? start.x : end.x;
			const y = start.y < end.y ? start.y : end.y;
			cell1 = this.world.getCell(x, y);
			cell2 = this.world.getCell(x, y);
			if (start.x < end.x === start.y < end.y) {
				if (!cell1 || cell1.posDiagOccupied()) {
					valid = false;
				}
			} else if (!cell1 || cell1.negDiagOccupied()) {
				valid = false;
			}
		}

		let door;
		if (!valid) {
			// Make a dummy door that doesn't do anything
			door = new Door(null, null, null, null);
		} else if (type === ONE_WAY) {
			door = new Door(new Edge(start, end, color), null, cell1, null);
		} else {
			door = new Door(
				new Edge(start, end, color),
				new Edge(end, start, color),
				cell1,
				cell2
			);
		}
		this.doors.push(door);
		if (!startsOpen) {
			door.act(DOORBELL_CLOSE, true, false);
		}
	}

	getDoor(doorIndex: number) {
		return this.doors[doorIndex];
	}

	// Kill all entities that intersect a given edge
	killAll(edge: Edge) {
		for (let i = 0; i < 2; ++i) {
			if (intersectEntitySegment(this.getPlayer(i), edge.segment)) {
				this.getPlayer(i).isDead = true;
			}
		}

		for (let i = 0; i < this.enemies.length; ++i) {
			const enemy = this.enemies[i];
			if (enemy.canCollide() && intersectEntitySegment(enemy, edge.segment)) {
				enemy.isDead = true;
			}
		}
	}

	tick(seconds: number) {
		if (this.gameStatus === GAME_WON || this.gameWon()) {
			this.gameStatus = GAME_WON;
		} else if (this.gameStatus === GAME_LOST || this.gameLost()) {
			this.gameStatus = GAME_LOST;
		}

		this.timeSinceStart += seconds;

		if (this.killKey) {
			this.playerA.isDead = true;
			this.playerB.isDead = true;
		}
		this.playerA.tick(seconds);
		this.playerB.tick(seconds);
		for (let i = 0; i < this.enemies.length; ++i) {
			this.enemies[i].tick(seconds);
		}
		for (let i = 0; i < this.enemies.length; ++i) {
			if (this.enemies[i].isDead) {
				this.enemies.splice(i, 1);
			}
		}

		this.spawnPointParticleTimer -= seconds;
		if (this.spawnPointParticleTimer <= 0) {
			const position = this.world.spawnPoint.sub(new Vector(0, 0.25));
			Particle()
				.position(position)
				.velocity(new Vector(randInRange(-0.3, 0.3), 0.3))
				.radius(0.03, 0.05)
				.bounces(0)
				.decay(0.1, 0.2)
				.color(1, 1, 1, 1)
				.circle()
				.gravity(-5);
			this.spawnPointParticleTimer += SPAWN_POINT_PARTICLE_FREQ;
		}
	}

	draw(
		c: CanvasRenderingContext2D,
		xmin: number,
		ymin: number,
		xmax: number,
		ymax: number
	) {
		// no enemy or particle is larger than two cells wide
		drawMinX = xmin - 2;
		drawMinY = ymin - 2;
		drawMaxX = xmax + 2;
		drawMaxY = ymax + 2;

		// spawn point and goal
		const spawnPoint = this.world.spawnPoint.add(this.spawnPointOffset);
		const goal = this.world.goal;
		if (
			spawnPoint.x >= drawMinX &&
			spawnPoint.y >= drawMinY &&
			spawnPoint.x <= drawMaxX &&
			spawnPoint.y <= drawMaxY
		) {
			drawSpawnPoint(c, spawnPoint);
		}
		if (
			goal.x >= drawMinX &&
			goal.y >= drawMinY &&
			goal.x <= drawMaxX &&
			goal.y <= drawMaxY
		) {
			drawGoal(c, goal, this.timeSinceStart);
		}

		// players
		this.playerA.draw(c);
		this.playerB.draw(c);

		// enemies
		for (let i = 0; i < this.enemies.length; ++i) {
			const enemy = this.enemies[i];
			const center = enemy.getCenter();
			if (
				center.x >= drawMinX &&
				center.y >= drawMinY &&
				center.x <= drawMaxX &&
				center.y <= drawMaxY
			) {
				enemy.draw(c);
			}
		}
	}

	loadLevel(level: LevelData) {
		this.world = new World(
			level.width,
			level.height,
			Vector.fromTuple(level.start),
			Vector.fromTuple(level.end)
		);

		for (let x = 0; x < level.width; x++) {
			for (let y = 0; y < level.height; y++) {
				const type = level.cells[y][x];
				this.world.setCell(x, y, type);
				if (type !== CELL_SOLID) {
					this.world.safety = new Vector(x + 0.5, y + 0.5);
				}
			}
		}
		this.world.createAllEdges();

		this.playerA.reset(this.world.spawnPoint, EDGE_RED);
		this.playerB.reset(this.world.spawnPoint, EDGE_BLUE);

		for (const entity of level.entities) {
			switch (entity.class) {
				case "cog":
					this.enemies.push(new GoldenCog(Vector.fromTuple(entity.pos)));
					break;
				case "wall":
					this.doors.push(
						createDoor(
							this.world,
							Vector.fromTuple(entity.end),
							Vector.fromTuple(entity.start),
							entity.oneway ? ONE_WAY : TWO_WAY,
							entity.color,
							entity.open
						)
					);
					break;
				case "button": {
					const button = new Doorbell(
						Vector.fromTuple(entity.pos),
						entity.type,
						true
					);
					button.doors = entity.walls;
					this.enemies.push(button);
					break;
				}
				case "sign":
					this.enemies.push(
						new HelpSign(Vector.fromTuple(entity.pos), entity.text)
					);
					break;
				case "enemy":
					this.enemies.push(createEnemy(entity, [this.playerA, this.playerB]));
					break;
			}
		}
	}
}

// bounding rectangle around all pixels currently being drawn to (also includes 2 cells of padding,
// so just check that the enemy center is within these bounds, don't bother about adding the radius)
export let drawMinX = 0;
export let drawMinY = 0;
export let drawMaxX = 0;
export let drawMaxY = 0;
