import { Circle } from "../circle.js";
import {
	lineOfSightWorld,
	overlapShapePlayers,
} from "../collisionDetection.js";
import {
	EDGE_FLOOR,
	ENEMY_ROCKET,
	ENEMY_ROCKET_SPIDER,
	STAT_ENEMY_DEATHS,
} from "../constants.js";
import { Contact } from "../contact.js";
import { Edge } from "../edge.js";
import { Entity } from "../entity.js";
import { gameState } from "../game.js";
import { Keyframe } from "../keyframe.js";
import { randInRange } from "../math.js";
import { Particle } from "../particle.js";
import { Player } from "../player.js";
import { Sprite } from "../sprite.js";
import { Vector } from "../vector.js";
import { FREEFALL_ACCEL } from "./freefallEnemy.js";
import { Rocket } from "./rocket.js";
import { SpawningEnemy } from "./spawningEntity.js";
import { WalkingEnemy } from "./walkingEnemy.js";

const SPIDER_LEG_HEIGHT = 0.5;

const SPIDER_BODY = 0;
const SPIDER_LEG1_TOP = 1;
const SPIDER_LEG2_TOP = 2;
const SPIDER_LEG3_TOP = 3;
const SPIDER_LEG4_TOP = 4;
const SPIDER_LEG5_TOP = 5;
const SPIDER_LEG6_TOP = 6;
const SPIDER_LEG7_TOP = 7;
const SPIDER_LEG8_TOP = 8;
const SPIDER_LEG1_BOTTOM = 9;
const SPIDER_LEG8_BOTTOM = 16;
const SPIDER_NUM_SPRITES = 17;

const spiderWalkingKeyframes = [
	new Keyframe(0, 0).add(
		0,
		-10,
		-20,
		-10,
		10,
		-10,
		10,
		-10,
		-20,
		20,
		10,
		70,
		20,
		70,
		20,
		20,
		10
	),
	new Keyframe(0, 0).add(
		0,
		10,
		-10,
		-20,
		-10,
		-20,
		-10,
		10,
		-10,
		20,
		20,
		10,
		70,
		10,
		70,
		20,
		20
	),
	new Keyframe(0, 0).add(
		0,
		-10,
		10,
		-10,
		-20,
		-10,
		-20,
		-10,
		10,
		70,
		20,
		20,
		10,
		20,
		10,
		70,
		20
	),
	new Keyframe(0, 0).add(
		0,
		-20,
		-10,
		10,
		-10,
		10,
		-10,
		-20,
		-10,
		10,
		70,
		20,
		20,
		20,
		20,
		10,
		70
	),
];

const spiderFallingKeyframes = [
	new Keyframe(0, 0).add(
		0,
		7,
		3,
		-1,
		-5,
		5,
		1,
		-3,
		-7,
		-14,
		-6,
		2,
		10,
		-10,
		-2,
		6,
		14
	),
	new Keyframe(0, 0).add(
		0,
		30,
		10,
		-30,
		-20,
		30,
		40,
		-10,
		-35,
		-50,
		-90,
		40,
		20,
		-50,
		-40,
		70,
		30
	),
];

const SPIDER_WIDTH = 0.9;
const SPIDER_HEIGHT = 0.3;
const SPIDER_SHOOT_FREQ = 2.0;
export const SPIDER_SPEED = 1.0;
const SPIDER_ELASTICITY = 1.0;
// Spiders can only see this many cells high
const SPIDER_SIGHT_HEIGHT = 10;

export const SPIDER_LEGS_RADIUS = 0.45;
const SPIDER_LEGS_WEAK_SPOT_RADIUS = 0.2;
const SPIDER_LEGS_ELASTICITY = 1.0;
const SPIDER_LEGS_FLOOR_ELASTICITY = 0.1;

export class RocketSpiderLegs extends WalkingEnemy {
	body: RocketSpider;
	weakSpot: Circle;
	velocity: Vector;

	constructor(center: Vector, angle: number, body: RocketSpider) {
		super(-1, center, SPIDER_LEGS_RADIUS, SPIDER_LEGS_ELASTICITY);
		this.body = body;
		this.weakSpot = new Circle(center, SPIDER_LEGS_WEAK_SPOT_RADIUS);
		if (angle <= Math.PI * 0.5 || angle > Math.PI * 0.6666666) {
			this.velocity = new Vector(SPIDER_SPEED, 0);
		} else {
			this.velocity = new Vector(-SPIDER_SPEED, 0);
		}
	}

	// Returns true iff the Spider and player are on the same level floor, less than 1 cell horizontal distance away,
	// and the spider is moving towards the player
	playerWillCollide(player: Player) {
		if (player.isDead) {
			return false;
		}
		let toReturn =
			Math.abs(
				player.getShape().getAabb().getBottom() -
					this.hitCircle.getAabb().getBottom()
			) < 0.01;
		const xRelative = player.getCenter().x - this.getCenter().x;
		toReturn =
			toReturn &&
			Math.abs(xRelative) < 1 &&
			this.velocity.x * xRelative > -0.01;
		return toReturn;
	}

	// Walks in a straight line, but doesn't walk into the player
	move(seconds: number) {
		if (this.isOnFloor()) {
			if (
				this.playerWillCollide(gameState.playerA) ||
				this.playerWillCollide(gameState.playerB)
			) {
				this.velocity.x *= -1;
			}
			return this.velocity.mul(seconds);
		} else {
			return this.accelerate(new Vector(0, FREEFALL_ACCEL), seconds);
		}
	}

	// Acts like it has elasticity of SPIDER_FLOOR_ELASTICITY on floors, and maintains constant horizontal speed
	reactToWorld(contact: Contact) {
		if (Edge.getOrientation(contact.normal) === EDGE_FLOOR) {
			const perpendicular = this.velocity.projectOntoAUnitVector(
				contact.normal
			);
			const parallel = this.velocity.sub(perpendicular);
			this.velocity = parallel
				.unit()
				.mul(SPIDER_SPEED)
				.add(perpendicular.mul(SPIDER_LEGS_FLOOR_ELASTICITY));
		}
	}

	// The player can kill the Spider by running through its legs
	reactToPlayer() {
		this.weakSpot.moveTo(this.hitCircle.getCenter());
		if (overlapShapePlayers(this.weakSpot).length === 0) {
			this.setDead(true);
		}
	}

	// The legs of the spider are responsible for killing the body
	setDead(isDead: boolean) {
		this.body.isDead = isDead;
		Entity.prototype.isDead = isDead;
	}

	onDeath() {
		gameState.incrementStat(STAT_ENEMY_DEATHS);

		// make things that look like legs fly everywhere
		const position = this.getCenter();
		for (let i = 0; i < 16; ++i) {
			let direction = Vector.fromAngle(randInRange(0, 2 * Math.PI));
			direction = direction.mul(randInRange(0.5, 5));

			const angle = randInRange(0, 2 * Math.PI);
			const angularVelocity = randInRange(-Math.PI, Math.PI);

			Particle()
				.position(position)
				.velocity(direction)
				.radius(0.25)
				.bounces(3)
				.elasticity(0.5)
				.decay(0.01)
				.line()
				.angle(angle)
				.angularVelocity(angularVelocity)
				.color(0, 0, 0, 1);
		}
	}

	draw() {}

	afterTick() {}
}

function drawSpiderBody(c: CanvasRenderingContext2D) {
	const innerRadius = 0.5;
	c.beginPath();
	for (let i = 0; i <= 21; i++) {
		const angle = (0.25 + (0.5 * i) / 21) * Math.PI;
		const radius = 0.6 + 0.05 * (i & 2);
		c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius - 0.5);
	}
	for (let i = 21; i >= 0; i--) {
		const angle = (0.25 + (0.5 * i) / 21) * Math.PI;
		c.lineTo(
			Math.cos(angle) * innerRadius,
			Math.sin(angle) * innerRadius - 0.5
		);
	}
	c.fill();
}

function drawSpiderLeg(c: CanvasRenderingContext2D) {
	c.beginPath();
	c.moveTo(0, 0);
	c.lineTo(0, -SPIDER_LEG_HEIGHT);
	c.stroke();
}

function createSpiderSprites() {
	const sprites = [];
	for (let i = 0; i < SPIDER_NUM_SPRITES; i++) {
		sprites.push(new Sprite(i === 0 ? drawSpiderBody : drawSpiderLeg));
	}

	for (let i = SPIDER_LEG1_TOP; i <= SPIDER_LEG8_TOP; i++) {
		sprites[i].setParent(sprites[SPIDER_BODY]);
	}

	for (let i = SPIDER_LEG1_BOTTOM; i <= SPIDER_LEG8_BOTTOM; i++) {
		sprites[i].setParent(sprites[i - SPIDER_LEG1_BOTTOM + SPIDER_LEG1_TOP]);
	}

	sprites[SPIDER_LEG1_TOP].offsetBeforeRotation = new Vector(
		SPIDER_WIDTH * 0.35,
		0
	);
	sprites[SPIDER_LEG2_TOP].offsetBeforeRotation = new Vector(
		SPIDER_WIDTH * 0.15,
		0
	);
	sprites[SPIDER_LEG3_TOP].offsetBeforeRotation = new Vector(
		SPIDER_WIDTH * -0.05,
		0
	);
	sprites[SPIDER_LEG4_TOP].offsetBeforeRotation = new Vector(
		SPIDER_WIDTH * -0.25,
		0
	);

	sprites[SPIDER_LEG5_TOP].offsetBeforeRotation = new Vector(
		SPIDER_WIDTH * 0.25,
		0
	);
	sprites[SPIDER_LEG6_TOP].offsetBeforeRotation = new Vector(
		SPIDER_WIDTH * 0.05,
		0
	);
	sprites[SPIDER_LEG7_TOP].offsetBeforeRotation = new Vector(
		SPIDER_WIDTH * -0.15,
		0
	);
	sprites[SPIDER_LEG8_TOP].offsetBeforeRotation = new Vector(
		SPIDER_WIDTH * -0.35,
		0
	);

	for (let i = SPIDER_LEG1_BOTTOM; i <= SPIDER_LEG8_BOTTOM; i++) {
		sprites[i].offsetBeforeRotation = new Vector(0, -SPIDER_LEG_HEIGHT);
	}

	return sprites;
}

export class RocketSpider extends SpawningEnemy {
	legs: RocketSpiderLegs;
	leftChasesA: boolean;
	leftSpawnPoint: Vector;
	rightSpawnPoint: Vector;
	timeSinceStart: number;
	sprites: Sprite[];
	animationDelay: number;
	animationIsOnFloor: boolean;

	constructor(center: Vector, angle: number) {
		super(
			ENEMY_ROCKET_SPIDER,
			center.add(
				new Vector(0, 0.81 - SPIDER_LEGS_RADIUS + SPIDER_HEIGHT * 0.5)
			),
			SPIDER_WIDTH,
			SPIDER_HEIGHT,
			SPIDER_ELASTICITY,
			SPIDER_SHOOT_FREQ,
			0
		);
		this.leftChasesA = true;
		this.leftSpawnPoint = new Vector(0, 0);
		this.rightSpawnPoint = new Vector(0, 0);
		this.timeSinceStart = 0;
		this.legs = new RocketSpiderLegs(center, angle, this);
		gameState.addEnemy(this.legs, this.legs.getShape().getCenter());

		this.sprites = createSpiderSprites();

		// spiders periodically "twitch" when their animation resets because the
		// collision detection doesn't see them as on the floor, so only change
		// to a falling animation if we haven't been on the floor for a few ticks
		this.animationDelay = 0;
		this.animationIsOnFloor = false;
	}

	canCollide() {
		return false;
	}

	// Returns true iff the target is in the spider's sight line
	playerInSight(target: Player) {
		if (target.isDead) {
			return false;
		}
		const relativePos = target.getCenter().sub(this.getCenter());
		const relativeAngle = relativePos.atan2();
		// Player needs to be within a certain height range, in the line of sight, and between the angle of pi/4 and 3pi/4
		if (
			relativePos.y < SPIDER_SIGHT_HEIGHT &&
			relativeAngle > Math.PI * 0.25 &&
			relativeAngle < Math.PI * 0.75
		) {
			return !lineOfSightWorld(
				this.getCenter(),
				target.getCenter(),
				gameState.world
			);
		}
		return false;
	}

	spawnRocket(loc: Vector, target: Player, angle: number) {
		gameState.addEnemy(
			new Rocket(loc, target, angle, 0, ENEMY_ROCKET),
			this.getCenter()
		);
	}

	// When either Player is above the cone of sight extending above the spider, shoot
	spawn() {
		const center = this.getCenter();
		this.leftSpawnPoint = new Vector(
			center.x - SPIDER_WIDTH * 0.4,
			center.y + SPIDER_HEIGHT * 0.4
		);
		this.rightSpawnPoint = new Vector(
			center.x + SPIDER_WIDTH * 0.4,
			center.y + SPIDER_HEIGHT * 0.4
		);

		if (this.playerInSight(gameState.playerA)) {
			if (this.playerInSight(gameState.playerB)) {
				this.spawnRocket(
					this.leftChasesA ? this.leftSpawnPoint : this.rightSpawnPoint,
					gameState.playerA,
					this.leftChasesA ? Math.PI * 0.75 : Math.PI * 0.25
				);
				this.spawnRocket(
					this.leftChasesA ? this.rightSpawnPoint : this.leftSpawnPoint,
					gameState.playerB,
					this.leftChasesA ? Math.PI * 0.25 : Math.PI * 0.75
				);
				this.leftChasesA = !this.leftChasesA;
				return true;
			} else {
				this.spawnRocket(
					this.leftSpawnPoint,
					gameState.playerA,
					Math.PI * 0.75
				);
				this.spawnRocket(
					this.rightSpawnPoint,
					gameState.playerA,
					Math.PI * 0.25
				);
				return true;
			}
		} else if (this.playerInSight(gameState.playerB)) {
			this.spawnRocket(this.leftSpawnPoint, gameState.playerB, Math.PI * 0.75);
			this.spawnRocket(this.rightSpawnPoint, gameState.playerB, Math.PI * 0.25);
			return true;
		}
		return false;
	}

	// Rocket spiders hover slowly over the floor, bouncing off walls with elasticity 1
	move() {
		// The height difference is h = player_height - SPIDER_LEGS_RADIUS + SPIDER_HEIGHT / 2
		return this.legs
			.getCenter()
			.sub(this.getCenter())
			.add(new Vector(0, 0.81 - SPIDER_LEGS_RADIUS + SPIDER_HEIGHT * 0.5));
	}

	afterTick(seconds: number) {
		const position = this.getCenter();
		this.sprites[SPIDER_BODY].offsetBeforeRotation = position;
		this.sprites[SPIDER_BODY].flip = this.legs.velocity.x > 0;

		// work out whether the spider is on the floor (walking animation) or in the air (falling animation)
		const isOnFloor = this.legs.isOnFloor();
		if (isOnFloor !== this.animationIsOnFloor) {
			// wait 1 tick before changing the animation to avoid "twitching"
			if (++this.animationDelay > 1) {
				this.animationIsOnFloor = isOnFloor;
				this.animationDelay = 0;
			}
		} else {
			this.animationDelay = 0;
		}

		this.timeSinceStart += seconds * 0.5;
		let frame;
		if (!this.animationIsOnFloor) {
			let percent = this.legs.velocity.y * -0.25;
			percent = percent < 0.01 ? 0 : 1 - 1 / (1 + percent);
			frame = spiderFallingKeyframes[0].lerpWith(
				spiderFallingKeyframes[1],
				percent
			);
		} else {
			frame = Keyframe.lerp(spiderWalkingKeyframes, 10 * this.timeSinceStart);
		}

		for (let i = 0; i < SPIDER_NUM_SPRITES; i++) {
			this.sprites[i].angle = frame.angles[i];
		}
	}

	// The body of the Spider kills the player
	reactToPlayer(player: Player) {
		player.isDead = true;
	}

	onDeath() {
		// don't add this death to the stats because it is added in the legs OnDeath() method

		// add something that looks like the body
		Particle()
			.position(this.getCenter())
			.bounces(1)
			.gravity(5)
			.decay(0.1)
			.custom(drawSpiderBody)
			.color(0, 0, 0, 1)
			.angle(0)
			.angularVelocity(randInRange(-Math.PI, Math.PI));
	}

	draw(c: CanvasRenderingContext2D) {
		c.strokeStyle = "black";
		c.fillStyle = "black";
		this.sprites[SPIDER_BODY].draw(c);
	}

	reactToWorld() {}
}
