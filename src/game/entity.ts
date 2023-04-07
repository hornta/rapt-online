import { onEntityWorld } from "./collisionDetection.js";
import { EDGE_FLOOR } from "./constants.js";
import { edgeQuad } from "./edgeQuad.js";
import { gameState } from "./game.js";
import { Shape } from "./shape.js";
import { Vector } from "./vector.js";

export abstract class Entity {
	protected velocity = new Vector(0, 0);
	#isDead = false;

	getVelocity() {
		return this.velocity;
	}

	setVelocity(velocity: Vector) {
		this.velocity = velocity;
	}

	get isDead() {
		return this.#isDead;
	}

	set isDead(isDead: boolean) {
		if (this.#isDead === isDead) {
			return;
		}
		this.#isDead = isDead;
		if (this.#isDead) {
			this.onDeath();
		} else {
			this.onRespawn();
		}
	}

	getCenter() {
		return this.getShape().getCenter();
	}

	setCenter(vec: Vector) {
		this.getShape().moveTo(vec);
	}

	abstract getColor(): number;

	abstract getShape(): Shape;

	abstract tick(seconds: number): void;

	abstract draw(c: CanvasRenderingContext2D): void;

	abstract onDeath(): void;

	onRespawn() {}

	isOnFloor() {
		onEntityWorld(this, edgeQuad, gameState.world);
		return edgeQuad.edges[EDGE_FLOOR] !== null;
	}
}
