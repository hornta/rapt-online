import { Circle } from "./circle.js";
import {
	collideEntityWorld,
	containsPointShape,
	overlapShapePlayers,
} from "./collisionDetection.js";
import { EDGE_ENEMIES } from "./constants.js";
import { Contact } from "./contact.js";
import { Entity } from "./entity.js";
import { gameState } from "./game.js";
import { Player } from "./player.js";
import { Vector } from "./vector.js";

const MAX_SPAWN_FORCE = 100.0;
const INNER_SPAWN_RADIUS = 1.0;
const OUTER_SPAWN_RADIUS = 1.1;

export abstract class Enemy extends Entity {
	elasticity: number;
	type: number;

	constructor(type: number, elasticity: number) {
		super();

		this.type = type;
		this.elasticity = elasticity;
	}

	// Most enemies should use the default Tick and override methods below
	tick(seconds: number) {
		if (this.avoidsSpawn()) {
			this.setVelocity(
				this.getVelocity().add(this.avoidSpawnForce().mul(seconds))
			);
		}

		const ref_deltaPosition = { ref: this.move(seconds) };
		const ref_velocity = { ref: this.getVelocity() };
		const shape = this.getShape();
		let contact: Contact | null = null;
		// Only collide enemies that can collide with the world
		if (this.canCollide()) {
			contact = collideEntityWorld(
				this,
				ref_deltaPosition,
				ref_velocity,
				this.elasticity,
				gameState.world,
				true
			);
			this.setVelocity(ref_velocity.ref);
		}
		shape.moveBy(ref_deltaPosition.ref);

		// If this enemy collided with the world, react to the world
		if (contact !== null) {
			this.reactToWorld(contact);
		}

		// If this is way out of bounds, kill it
		if (!containsPointShape(shape.getCenter(), gameState.world.getHugeAabb())) {
			this.isDead = true;
		}

		// If the enemy is still alive, collide it with the players
		if (!this.isDead) {
			const players = overlapShapePlayers(shape);
			for (let i = 0; i < players.length; ++i) {
				if (!players[i].isDead) {
					this.reactToPlayer(players[i]);
				}
			}
		}

		this.afterTick(seconds);
	}

	getColor() {
		return EDGE_ENEMIES;
	}

	getElasticity() {
		return this.elasticity;
	}

	getType() {
		return this.type;
	}

	getTarget() {
		return -1;
	}

	setTarget(player: Player) {
		//
	}

	onDeath() {
		//
	}

	canCollide() {
		return true;
	}

	avoidsSpawn() {
		return false;
	}

	// Accelerate updates velocity and returns the delta position
	accelerate(accel: Vector, seconds: number) {
		this.setVelocity(this.velocity.add(accel.mul(seconds)));
		return this.velocity.mul(seconds);
	}

	avoidSpawnForce() {
		const relSpawnPosition = gameState.getSpawnPoint().sub(this.getCenter());
		const radius = (this.getShape() as Circle).radius;
		const distance = relSpawnPosition.length() - radius;

		// If inside the inner circle, push with max force
		if (distance < INNER_SPAWN_RADIUS) {
			return relSpawnPosition.unit().mul(-MAX_SPAWN_FORCE);
		} else if (distance < OUTER_SPAWN_RADIUS) {
			const magnitude =
				MAX_SPAWN_FORCE *
				(1 -
					(distance - INNER_SPAWN_RADIUS) /
						(OUTER_SPAWN_RADIUS - INNER_SPAWN_RADIUS));
			return relSpawnPosition.unit().mul(-magnitude);
		} else {
			return new Vector(0, 0);
		}
	}

	// THE FOLLOWING SHOULD BE OVERRIDDEN BY ALL ENEMIES:

	// This moves the enemy
	move(seconds: number): Vector {
		return new Vector(0, 0);
	}

	// Enemy's reaction to a collision with the World, by default has no effect
	reactToWorld(contact: Contact): void {}

	// Enemy's reaction to a collision with a Player, by default kills the Player
	reactToPlayer(player: Player) {
		player.isDead = true;
	}

	// Do stuff that needs an updated enemy, like move the graphics
	afterTick(seconds: number): void {}
}
