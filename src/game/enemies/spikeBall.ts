import { Circle } from "../circle.js";
import { ENEMY_SPIKE_BALL } from "../constants.js";
import { Enemy } from "../enemy.js";
import { randInRange } from "../math.js";
import { Sprite } from "../sprite.js";
import { Vector } from "../vector.js";

const SPIKE_BALL_RADIUS = 0.2;

function makeDrawSpikes(count: number) {
	const radii: number[] = [];
	for (let i = 0; i < count; i++) {
		radii.push(randInRange(0.5, 1.5));
	}
	return function (c: CanvasRenderingContext2D) {
		c.strokeStyle = "black";
		c.beginPath();
		for (let i = 0; i < count; i++) {
			const angle = i * ((2 * Math.PI) / count);
			const radius = SPIKE_BALL_RADIUS * radii[i];
			c.moveTo(0, 0);
			c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
		}
		c.stroke();
	};
}

export class SpikeBall extends Enemy {
	hitCircle: Circle;
	sprites: Sprite[];

	constructor(center: Vector) {
		super(ENEMY_SPIKE_BALL, 0);
		this.hitCircle = new Circle(center, SPIKE_BALL_RADIUS);

		this.sprites = [
			new Sprite(makeDrawSpikes(11)),
			new Sprite(makeDrawSpikes(13)),
			new Sprite(makeDrawSpikes(7)),
		];

		this.sprites[1].setParent(this.sprites[0]);
		this.sprites[2].setParent(this.sprites[0]);

		this.sprites[0].angle = randInRange(0, 2 * Math.PI);
		this.sprites[1].angle = randInRange(0, 2 * Math.PI);
		this.sprites[2].angle = randInRange(0, 2 * Math.PI);
	}

	getShape() {
		return this.hitCircle;
	}

	canCollide() {
		return false;
	}

	afterTick(seconds: number) {
		this.sprites[0].offsetBeforeRotation = this.getCenter();

		this.sprites[0].angle -= seconds * ((25 * Math.PI) / 180);
		this.sprites[1].angle += seconds * ((65 * Math.PI) / 180);
		this.sprites[2].angle += seconds * ((15 * Math.PI) / 180);
	}

	draw(c: CanvasRenderingContext2D) {
		this.sprites[0].draw(c);
	}

	reactToWorld() {}
}
