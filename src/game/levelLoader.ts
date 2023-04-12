import { LevelData } from "../schemas";
import { DOORBELL_CLOSE, ONE_WAY } from "./constants";
import { Door } from "./door";
import { Edge } from "./edge";
import { Player } from "./player";
import { Vector } from "./vector";
import { World } from "./world";
import { Bomber } from "./enemies/bomber";
import { BouncyRocketLauncher } from "./enemies/bouncyRocketLauncher";
import { CorrosionCloud } from "./corrosionCloud";
import { DoomMagnet } from "./enemies/doomMagnet";
import { Grenadier } from "./enemies/grenadier";
import { JetStream } from "./enemies/jetStream";
import { Headache } from "./enemies/headache";
import { Hunter } from "./enemies/hunter";
import { MultiGun } from "./enemies/multiGun";
import { Popper } from "./enemies/popper";
import { RocketSpider } from "./enemies/rocketSpider";
import { ShockHawk } from "./enemies/shockHawk";
import { SpikeBall } from "./enemies/spikeBall";
import { Stalacbat } from "./enemies/stalacbat";
import { WallAvoider } from "./enemies/wallAvoider";
import { WallCrawler } from "./enemies/wallCrawler";
import { Wheeligator } from "./enemies/wheeligator";

export const createDoor = (
	world: World,
	start: Vector,
	end: Vector,
	type: number,
	color: number,
	startsOpen: boolean
) => {
	let cell1;
	let cell2;
	let valid = true;
	// left wall
	if (start.y + 1 === end.y && start.x === end.x) {
		cell1 = world.getCell(start.x, start.y);
		cell2 = world.getCell(start.x - 1, start.y);
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
		cell1 = world.getCell(start.x - 1, end.y);
		cell2 = world.getCell(start.x, end.y);
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
		cell1 = world.getCell(start.x, start.y - 1);
		cell2 = world.getCell(start.x, start.y);
		if (!cell1 || !cell2 || cell1.ceilingOccupied() || cell2.floorOccupied()) {
			valid = false;
		}
	}
	// floor
	else if (start.x - 1 === end.x && start.y === end.y) {
		cell1 = world.getCell(end.x, start.y);
		cell2 = world.getCell(end.x, start.y - 1);
		if (!cell1 || !cell2 || cell1.floorOccupied() || cell2.ceilingOccupied()) {
			valid = false;
		}
	}
	//diagonal
	else {
		const x = start.x < end.x ? start.x : end.x;
		const y = start.y < end.y ? start.y : end.y;
		cell1 = world.getCell(x, y);
		cell2 = world.getCell(x, y);
		if (start.x < end.x === start.y < end.y) {
			if (!cell1 || cell1.posDiagOccupied()) {
				valid = false;
			}
		} else if (!cell1 || cell1.negDiagOccupied()) {
			valid = false;
		}
	}

	let door: Door;
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
	if (!startsOpen) {
		door.act(DOORBELL_CLOSE, true, false);
	}

	return door;
};

export const createEnemy = (
	{
		type,
		angle,
		color,
		...enemy
	}: Extract<LevelData["entities"][number], { class: "enemy" }>,
	players: [Player, Player]
) => {
	const target = color === 1 ? players[0] : players[1];
	const pos = Vector.fromTuple(enemy.pos);
	switch (type) {
		case "bomber":
			return new Bomber(pos, angle);
		case "bouncy rocket launcher":
			return new BouncyRocketLauncher(pos, target);
		case "corrosion cloud":
			return new CorrosionCloud(pos, target);
		case "doom magnet":
			return new DoomMagnet(pos);
		case "grenadier":
			return new Grenadier(pos, target);
		case "jet stream":
			return new JetStream(pos, angle);
		case "headache":
			return new Headache(pos, target);
		case "hunter":
			return new Hunter(pos);
		case "multi gun":
			return new MultiGun(pos);
		case "popper":
			return new Popper(pos);
		case "rocket spider":
			return new RocketSpider(pos, angle);
		case "shock hawk":
			return new ShockHawk(pos, target);
		case "spike ball":
			return new SpikeBall(pos);
		case "stalacbat":
			return new Stalacbat(pos, target);
		case "wall avoider":
			return new WallAvoider(pos, target);
		case "wall crawler":
			return new WallCrawler(pos, angle);
		case "wheeligator":
			return new Wheeligator(pos, angle);
		default:
			throw new Error("Invalid enemy type in level");
	}
};
