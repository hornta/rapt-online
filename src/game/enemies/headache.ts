import { lineOfSightWorld } from "../collisionDetection.js";
import { ENEMY_HEADACHE, GAME_SCALE, STAT_ENEMY_DEATHS } from "../constants.js";
import { gameState } from "../game.js";
import { randInRange } from "../math.js";
import { Particle } from "../particle.js";
import { Player } from "../player.js";
import { Vector } from "../vector.js";
import { HoveringEnemy } from "./hoveringEnemy.js";

const HEADACHE_RADIUS = 0.15;
const HEADACHE_ELASTICITY = 0;
const HEADACHE_SPEED = 3;
const HEADACHE_RANGE = 6;

const HEADACHE_CLOUD_RADIUS = HEADACHE_RADIUS * 0.5;

export class HeadacheChain {
	points: Vector[];
	point: Vector;
	angle: number;

	constructor(center: Vector) {
		this.points = [];
		this.point = new Vector(center.x * GAME_SCALE, center.y * GAME_SCALE);
		this.point.x += (Math.random() - 0.5) * HEADACHE_RADIUS;
		this.point.y += (Math.random() - 0.5) * HEADACHE_RADIUS;
		this.angle = Math.random() * Math.PI * 2;
	}

	tick(seconds: number, center: Vector) {
		const speed = 600;

		const dx = this.point.x - center.x * GAME_SCALE;
		const dy = this.point.y - center.y * GAME_SCALE;
		const percentFromCenter = Math.min(
			1,
			Math.sqrt(dx * dx + dy * dy) / HEADACHE_CLOUD_RADIUS
		);

		let angleFromCenter = Math.atan2(dy, dx) - this.angle;
		while (angleFromCenter < -Math.PI) {
			angleFromCenter += Math.PI * 2;
		}
		while (angleFromCenter > Math.PI) {
			angleFromCenter -= Math.PI * 2;
		}
		const percentHeading = (Math.PI - Math.abs(angleFromCenter)) / Math.PI;

		const randomOffset = speed * (Math.random() - 0.5) * seconds;
		this.angle +=
			randomOffset * (1 - percentFromCenter * 0.8) +
			percentHeading * percentFromCenter * (angleFromCenter > 0 ? -2 : 2);
		this.angle -= Math.floor(this.angle / (Math.PI * 2)) * Math.PI * 2;

		this.point.x += speed * Math.cos(this.angle) * seconds;
		this.point.y += speed * Math.sin(this.angle) * seconds;
		this.points.push(new Vector(this.point.x, this.point.y));
		if (this.points.length > 15) {
			this.points.shift();
		}
	}

	draw(c: CanvasRenderingContext2D) {
		for (let i = 1; i < this.points.length; i++) {
			const a = this.points[i - 1];
			const b = this.points[i];
			c.strokeStyle =
				"rgba(0, 0, 0, " + (i / this.points.length).toFixed(3) + ")";
			c.beginPath();
			c.moveTo(a.x / GAME_SCALE, a.y / GAME_SCALE);
			c.lineTo(b.x / GAME_SCALE, b.y / GAME_SCALE);
			c.stroke();
		}
	}
}

export class Headache extends HoveringEnemy {
	target: Player;
	isAttached: boolean;
	isTracking: boolean;
	restingOffset: Vector;
	chains: HeadacheChain[];

	constructor(center: Vector, target: Player) {
		super(ENEMY_HEADACHE, center, HEADACHE_RADIUS, HEADACHE_ELASTICITY);

		this.target = target;
		this.isAttached = false;
		this.isTracking = false;
		this.restingOffset = new Vector(0, -10);

		this.chains = [];
		for (let i = 0; i < 4; i++) {
			this.chains.push(new HeadacheChain(center));
		}
	}

	move(seconds: number) {
		this.isTracking = false;

		// If the headache isn't yet attached to a Player
		if (!this.isAttached) {
			if (this.target.isDead) {
				return new Vector(0, 0);
			}
			let delta = this.target.getCenter().sub(this.getCenter());
			if (
				delta.lengthSquared() < HEADACHE_RANGE * HEADACHE_RANGE &&
				!lineOfSightWorld(
					this.getCenter(),
					this.target.getCenter(),
					gameState.world
				)
			) {
				// Seeks the top of the Player, not the center
				delta.y += 0.45;
				// Multiply be 3 so it attaches more easily if its close to a player
				if (
					delta.lengthSquared() >
					HEADACHE_SPEED * seconds * HEADACHE_SPEED * seconds * 3
				) {
					this.isTracking = true;
					delta.normalize();
					delta = delta.mul(HEADACHE_SPEED * seconds);
				} else {
					this.isAttached = true;
				}
				return delta;
			}
		} else {
			// If a headache is attached to a dead player, it vanishes
			if (this.target.isDead) {
				this.isDead = true;
			}
			// Otherwise it moves with the player
			const delta = this.target
				.getCenter()
				.add(new Vector(0, 0.45))
				.sub(this.getCenter());
			// If player is crouching, adjust position
			if (this.target.getCrouch() && this.target.isOnFloor()) {
				delta.y -= 0.25;
				if (this.target.facingRight) {
					delta.x += 0.15;
				} else {
					delta.x -= 0.15;
				}
			}
			this.hitCircle.moveBy(delta);
		}
		return new Vector(0, 0);
	}

	reactToWorld() {
		// Nothing happens
	}

	onDeath() {
		gameState.incrementStat(STAT_ENEMY_DEATHS);

		const position = this.getCenter();

		// body
		const direction = Vector.fromAngle(randInRange(0, 2 * Math.PI)).mul(
			randInRange(0, 0.05)
		);
		const body = Particle()
			.position(position)
			.velocity(direction)
			.radius(HEADACHE_RADIUS)
			.bounces(3)
			.elasticity(0.5)
			.decay(0.01)
			.circle()
			.gravity(5);
		if (this.target === gameState.playerA) {
			body.color(1, 0, 0, 1);
		} else {
			body.color(0, 0, 1, 1);
		}

		// black lines out from body
		for (let i = 0; i < 50; ++i) {
			const rotationAngle = randInRange(0, 2 * Math.PI);
			const direction = Vector.fromAngle(rotationAngle).mul(randInRange(3, 5));
			Particle()
				.position(this.getCenter())
				.velocity(direction)
				.angle(rotationAngle)
				.radius(0.05)
				.bounces(3)
				.elasticity(0.5)
				.decay(0.01)
				.line()
				.color(0, 0, 0, 1);
		}
	}

	reactToPlayer(player: Player) {
		if (player === this.target) {
			player.disableJump();
		} else if (
			player.getVelocity().y < 0 &&
			player.getCenter().y > this.getCenter().y
		) {
			// The other player must jump on the headache from above to kill it
			this.isDead = true;
		}
	}

	getTarget() {
		return Number(this.target === gameState.playerB);
	}

	afterTick(seconds: number) {
		const center = this.getCenter();
		for (let i = 0; i < this.chains.length; i++) {
			this.chains[i].tick(seconds, center);
		}
	}

	draw(c: CanvasRenderingContext2D) {
		const center = this.getCenter();

		c.strokeStyle = "black";
		for (let i = 0; i < this.chains.length; i++) {
			this.chains[i].draw(c);
		}

		c.fillStyle = this.target === gameState.playerA ? "red" : "blue";
		c.beginPath();
		c.arc(center.x, center.y, HEADACHE_RADIUS * 0.75, 0, Math.PI * 2, false);
		c.fill();
		c.stroke();
	}
}
