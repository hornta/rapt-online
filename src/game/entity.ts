import { onEntityWorld } from "./collisionDetection";
import { EDGE_FLOOR } from "./constants";
import { edgeQuad } from "./edgeQuad";
import { gameState } from "./game";
import { Shape } from "./shape";
import { Vector } from "./vector";

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
