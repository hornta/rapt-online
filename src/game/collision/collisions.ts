import { CELL_EMPTY } from "../constants";
import { Entity } from "../entity";
import { Shape } from "../shape";
import { Vector } from "../vector";
import { World } from "../world";
import { collideShapeSegment } from "./collisions/collideShapeSegment";
import { overlapShapes } from "./overlap/overlapShapes";

const MAX_VELOCITY = 30;
const MAX_COLLISIONS = 20;
const MAX_EMERGENCY_ELASTICITY = 0.5;

export const collideEntityWorld = (
	entity: Entity,
	ref_deltaPosition: { ref: Vector },
	ref_velocity: { ref: Vector },
	elasticity: number,
	world: World,
	emergency: boolean
) => {
	return collideShapeWorld(
		entity.getShape(),
		ref_deltaPosition,
		ref_velocity,
		elasticity,
		world,
		entity.getColor(),
		emergency
	);
};

export const collideShapeWorld = (
	shape: Shape,
	ref_deltaPosition: { ref: Vector },
	ref_velocity: { ref: Vector },
	elasticity: number,
	world: World,
	color: number,
	emergency: boolean
) => {
	// only chuck norris may divide by zero
	if (ref_deltaPosition.ref.lengthSquared() < 0.000000000001) {
		ref_deltaPosition.ref = new Vector(0, 0);
		return null;
	}

	// clamp the velocity, so this won't blow up
	// if we don't, the aabb will get too big.
	if (ref_velocity.ref.lengthSquared() > MAX_VELOCITY * MAX_VELOCITY) {
		ref_velocity.ref = ref_velocity.ref.unit().mul(MAX_VELOCITY);
	}

	// this stores the contact that happened last (if any)
	// since this can hit multiple items in a single timestep
	let lastContact = null;

	const originalDelta = ref_deltaPosition.ref;
	const originalVelocity = ref_velocity.ref;

	// try this up to a certain number of times, if we get there we are PROBABLY stuck.
	for (let i = 0; i < MAX_COLLISIONS; i++) {
		// check all the edges in the expanded bounding box of the swept area
		const newShape = shape.copy();
		newShape.moveBy(ref_deltaPosition.ref);
		const areaToCheck = shape.getAabb().union(newShape.getAabb());
		const edges = world.getEdgesInAabb(areaToCheck, color);

		// make a temporary new contact in case there is (another) collision
		let newContact = null;

		// see if this setting for deltaPosition causes a collision
		for (let it = 0; it < edges.length; it++) {
			const edge = edges[it];
			const segmentContact = collideShapeSegment(
				shape,
				ref_deltaPosition.ref,
				edge.segment
			);
			if (
				newContact === null ||
				(segmentContact !== null &&
					segmentContact.proportionOfDelta < newContact.proportionOfDelta)
			) {
				newContact = segmentContact;
			}
		}

		// if we didn't hit anything this iteration, return our last hit
		// on the first iteration, this means return NULL
		if (newContact === null) {
			emergencyCollideShapeWorld(shape, ref_deltaPosition, ref_velocity, world);
			return lastContact;
		}

		// modify the velocity to not be pointing into the edge
		const velocityPerpendicular = ref_velocity.ref.projectOntoAUnitVector(
			newContact.normal
		);
		const velocityParallel = ref_velocity.ref.sub(velocityPerpendicular);
		ref_velocity.ref = velocityParallel.add(
			velocityPerpendicular.mul(-elasticity)
		);

		// push the delta-position out of the edge
		const deltaPerpendicular = ref_deltaPosition.ref.projectOntoAUnitVector(
			newContact.normal
		);
		const deltaParallel = ref_deltaPosition.ref.sub(deltaPerpendicular);

		// TODO: This was here when I ported this, but it is incorrect because it
		// stops you short of an edge, which is good except the distance from that
		// edge grows with your speed.	A correct version is after this.
		// ref_deltaPosition.ref = ref_deltaPosition.ref.mul(newContact.proportionOfDelta).projectOntoAUnitVector(newContact.normal).mul(-elasticity).add(deltaParallel).add(newContact.normal.mul(0.001));

		const proportionLeft = 1 - newContact.proportionOfDelta;
		ref_deltaPosition.ref = ref_deltaPosition.ref
			.mul(newContact.proportionOfDelta)
			.add(deltaPerpendicular.mul(-elasticity * proportionLeft))
			.add(deltaParallel.mul(proportionLeft))
			.add(newContact.normal.mul(0.0001));

		// the newly found contact is now the last one
		lastContact = newContact;
	}

	if (typeof console !== "undefined" && console.log) {
		console.log("Collision loop ran out, damn!");
	}

	// if we are all looped out, take some emergency collision prevention measures.
	ref_deltaPosition.ref = new Vector(0, 0);
	ref_velocity.ref = originalVelocity.mul(
		-(elasticity < MAX_EMERGENCY_ELASTICITY
			? elasticity
			: MAX_EMERGENCY_ELASTICITY)
	);
	if (emergency) {
		emergencyCollideShapeWorld(
			shape,
			{ ref: originalDelta },
			ref_velocity,
			world
		);
	}
	return lastContact;
};

// how far should we push something out if there's an emergency?
const EMERGENCY_PUSH_DISTANCE = 0.1;

const emergencyCollideShapeWorld = (
	shape: Shape,
	ref_deltaPosition: { ref: Vector },
	ref_velocity: { ref: Vector },
	world: World
) => {
	// do we need to push this shape anywhere?
	let push = false;

	const newShape = shape.copy();
	newShape.moveBy(ref_deltaPosition.ref);

	if (newShape.getAabb().getBottom() < 0) {
		push = true;
	}
	if (newShape.getAabb().getTop() > world.height) {
		push = true;
	}
	if (newShape.getAabb().getLeft() < 0) {
		push = true;
	}
	if (newShape.getAabb().getRight() > world.width) {
		push = true;
	}

	if (!push) {
		const cells = world.getCellsInAabb(newShape.getAabb());
		for (let it = 0; it < cells.length; it++) {
			const cellShape = cells[it].getShape();
			if (!cellShape) {
				continue;
			}

			if (overlapShapes(newShape, cellShape)) {
				push = true;
				break;
			}
		}
	}

	if (push) {
		const minX = Math.floor(newShape.getCenter().x) - 3;
		const maxX = Math.floor(newShape.getCenter().x) + 3;
		const minY = Math.floor(newShape.getCenter().y) - 3;
		const maxY = Math.floor(newShape.getCenter().y) + 3;

		// find the closest open square, push toward that
		let bestSafety = world.safety;
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				const cell = world.getCell(x, y);
				// if this cell doesn't exist or has a shape in it, not good to push towards.
				if (cell === null || cell.type !== CELL_EMPTY) {
					continue;
				}

				// loop through centers of squares and replace if closer
				const candidateSafety = new Vector(x + 0.5, y + 0.5);
				if (
					candidateSafety.sub(newShape.getCenter()).lengthSquared() <
					bestSafety.sub(newShape.getCenter()).lengthSquared()
				) {
					bestSafety = candidateSafety;
				}
			}
		}

		newShape.moveBy(
			bestSafety.sub(newShape.getCenter()).unit().mul(EMERGENCY_PUSH_DISTANCE)
		);
		ref_deltaPosition.ref = newShape.getCenter().sub(shape.getCenter());

		// REMOVED TO PREVENT STOPPING WHEELIGATORS / THE PLAYER
		// ref_velocity.ref = new Vector(0, 0);
	}
};
