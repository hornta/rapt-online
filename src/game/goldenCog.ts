import { Circle } from "./circle.js";
import {
	GAME_IN_PLAY,
	STAT_COGS_COLLECTED,
	STAT_NUM_COGS,
} from "./constants.js";
import { Enemy } from "./enemy.js";
import { gameState } from "./game.js";
import { randInRange } from "./math.js";
import { Particle } from "./particle.js";
import { Vector } from "./vector.js";

const GOLDEN_COG_RADIUS = 0.25;

export class GoldenCog extends Enemy {
	hitCircle: Circle;
	timeSinceStart: number;

	constructor(center: Vector) {
		super(-1, 0);
		this.hitCircle = new Circle(center, GOLDEN_COG_RADIUS);
		this.timeSinceStart = 0;

		gameState.incrementStat(STAT_NUM_COGS);
	}

	getShape() {
		return this.hitCircle;
	}

	reactToPlayer() {
		this.isDead = true;
	}

	onDeath() {
		if (gameState.gameStatus === GAME_IN_PLAY) {
			gameState.incrementStat(STAT_COGS_COLLECTED);
		}
		// Golden particle goodness
		const position = this.getCenter();
		for (let i = 0; i < 100; ++i) {
			let direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
			direction = this.velocity.add(direction.mul(randInRange(1, 5)));

			Particle()
				.position(position)
				.velocity(direction)
				.radius(0.01, 1.5)
				.bounces(0, 4)
				.elasticity(0.05, 0.9)
				.decay(0.01, 0.5)
				.color(0.9, 0.87, 0, 1)
				.mixColor(1, 0.96, 0, 1)
				.triangle();
		}
	}

	afterTick(seconds: number) {
		this.timeSinceStart += seconds;
	}

	draw(c: CanvasRenderingContext2D) {
		const position = this.getCenter();
		drawGoldenCog(c, position.x, position.y, this.timeSinceStart);
	}
}

function drawGoldenCog(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	time: number
) {
	c.save();
	c.strokeStyle = "rgb(255, 245, 0)";
	c.fillStyle = "rgb(255, 245, 0)";

	c.translate(x, y);
	c.rotate((time * Math.PI) / 2);
	drawCog(c, x, y, GOLDEN_COG_RADIUS, 16, 5, false, 64);
	c.restore();
}

function drawCog(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	radius: number,
	numTeeth: number,
	numSpokes: number,
	changeBlending: boolean,
	numVertices: number
) {
	const spokeRadius = radius * 0.8;
	const spokeWidth1 = radius * 0.125;
	const spokeWidth2 = radius * 0.05;
	c.miterLimit = 1;
	for (let loop = 0; loop < 2; loop++) {
		for (let iter = 0; iter <= loop; iter++) {
			c.beginPath();
			for (let i = 0; i <= numVertices; i++) {
				const angle = ((i + 0.25) / numVertices) * (2 * Math.PI);
				const s = Math.sin(angle);
				const csn = Math.cos(angle);
				const r1 = radius * 0.7;
				const r2 = radius * (1 + Math.cos(angle * numTeeth * 0.5) * 0.1);
				if (!loop || !iter) {
					c.lineTo(csn * r1, s * r1);
				}
				if (!loop || iter) {
					c.lineTo(csn * r2, s * r2);
				}
			}
			c.stroke();
		}
		for (let i = 0; i < numSpokes; i++) {
			const angle = (i / numSpokes) * (Math.PI * 2);
			const s = Math.sin(angle);
			const csn = Math.cos(angle);
			c.beginPath();
			c.lineTo(s * spokeWidth1, -csn * spokeWidth1);
			c.lineTo(-s * spokeWidth1, csn * spokeWidth1);
			c.lineTo(
				csn * spokeRadius - s * spokeWidth2,
				s * spokeRadius + csn * spokeWidth2
			);
			c.lineTo(
				csn * spokeRadius + s * spokeWidth2,
				s * spokeRadius - csn * spokeWidth2
			);
			c.fill();
		}
	}
}
