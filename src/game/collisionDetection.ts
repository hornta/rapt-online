// porting notes:
//
// - a prefix of "ref_" on the variable name means it was a non-const reference in C++
//	 this is handled like so:
//
//	 // C++
//	 void func(int& foo) {
//		 foo = 2;
//	 }
//
//	 void main() {
//		 int foo;
//		 func(foo);
//		 cout << foo << endl;
//	 }
//
//	 // JavaScript
//	 function func(ref_foo) {
//		 ref_foo.ref = 2;
//	 }
//
//	 function main() {
//		 var ref_foo = {};
//		 func(ref_foo);
//		 console.log(ref_foo.ref);
//	 }
//
// - gameState is a global, so all functions that take gameState as an argument in C++ don't now

import { AABB, isAABB } from "./aabb.js";
import { Circle, isCircle } from "./circle.js";
import { EDGE_ENEMIES, CELL_EMPTY } from "./constants.js";
import { Contact } from "./contact.js";
import { EdgeQuad } from "./edgeQuad.js";
import { Entity } from "./entity.js";
import { gameState } from "./game.js";
import { Polygon, isPolygon } from "./polygon.js";
import { Segment } from "./segment.js";
import { Shape } from "./shape.js";
import { Vector } from "./vector.js";
import { World } from "./world.js";

const MAX_VELOCITY = 30;
const MAX_COLLISIONS = 20;
// if the collision detection system fails, what elasticity should we use?
const MAX_EMERGENCY_ELASTICITY = 0.5;
const ON_MARGIN = 0.01;
const MAX_LOS_DISTANCE_SQUARED = 625;

// how far should we push something out if there's an emergency?
const EMERGENCY_PUSH_DISTANCE = 0.1;

////////////////////////////////////////////////////////////////////////////////
// public functions
////////////////////////////////////////////////////////////////////////////////

// collisions
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

// overlaps
export const overlapShapePlayers = (shape: Shape) => {
	const players = [];
	if (overlapShapes(gameState.playerA.getShape(), shape)) {
		players.push(gameState.playerA);
	}
	if (overlapShapes(gameState.playerB.getShape(), shape)) {
		players.push(gameState.playerB);
	}
	return players;
};

// on-edges
export const onEntityWorld = (
	entity: Entity,
	edgeQuad: EdgeQuad,
	world: World
) => {
	penetrationEntityWorld(entity, edgeQuad, world);
	edgeQuad.throwOutIfGreaterThan(ON_MARGIN);
};

// line of sight
export const lineOfSightWorld = (eye: Vector, target: Vector, world: World) => {
	// if the target is too far, we can't see it
	if (target.sub(eye).lengthSquared() > MAX_LOS_DISTANCE_SQUARED) {
		return null;
	}

	const edges = world.getEdgesInAabb(new AABB(eye, target), EDGE_ENEMIES);
	let minLosProportion = 1.1;
	let firstEdge = null;
	for (let it = 0; it < edges.length; it++) {
		// this is only for edges that face towards the eye
		if (target.sub(eye).dot(edges[it].segment.normal) >= 0) {
			continue;
		}

		// find the edge closest to the viewer
		const ref_losProportion: { ref: number } = {} as { ref: number };

		// if the LOS is not blocked by this edge, then ignore this edge
		if (
			!intersectSegments(
				new Segment(eye, target),
				edges[it].segment,
				ref_losProportion,
				{} as { ref: number },
				{} as { ref: Vector }
			)
		) {
			continue;
		}

		// if another edge was already closer, ignore this edge
		if (ref_losProportion.ref >= minLosProportion) {
			continue;
		}

		// otherwise this is the closest edge to the eye
		minLosProportion = ref_losProportion.ref;
		firstEdge = edges[it];
	}

	return firstEdge;
};

// puts the closest point in the world into worldpoint and the one on the shape
// to shapepoint, returns the distance to the closest point in the world to the shape
// will always find any point within radius of any point on the shape, may find ones farther out
// returns infinity if nothing was found within radius
export const closestToEntityWorld = (
	entity: Entity,
	radius: number,
	ref_shapePoint: { ref: Vector },
	ref_worldPoint: { ref: Vector },
	world: World
) => {
	const shape = entity.getShape();
	const boundingBox = shape.getAabb().expand(radius);
	const edges = world.getEdgesInAabb(boundingBox, entity.getColor());

	let distance = Number.POSITIVE_INFINITY;
	for (let it = 0; it < edges.length; it++) {
		const ref_thisShapePoint: { ref: Vector } = {} as { ref: Vector };
		const ref_thisWorldPoint: { ref: Vector } = {} as { ref: Vector };
		const thisDistance = closestToShapeSegment(
			shape,
			ref_thisShapePoint,
			ref_thisWorldPoint,
			edges[it].segment
		);
		if (thisDistance < distance) {
			distance = thisDistance;
			ref_shapePoint.ref = ref_thisShapePoint.ref;
			ref_worldPoint.ref = ref_thisWorldPoint.ref;
		}
	}
	return distance;
};

export const containsPointShape = (point: Vector, shape: Shape) => {
	if (isCircle(shape)) {
		return (
			point.sub(shape.center).lengthSquared() < shape.radius * shape.radius
		);
	} else if (isAABB(shape)) {
		return (
			point.x >= shape.lowerLeft.x &&
			point.x <= shape.lowerLeft.x + shape.size.x &&
			point.y >= shape.lowerLeft.y &&
			point.y <= shape.lowerLeft.y + shape.size.y
		);
	} else if (isPolygon(shape)) {
		const len = shape.vertices.length;
		for (let i = 0; i < len; ++i) {
			// Is this point outside this edge?  if so, it's not inside the polygon
			if (
				point
					.sub(shape.vertices[i].add(shape.center))
					.dot(shape.segments[i].normal) > 0
			) {
				return false;
			}
		}
		// if the point was inside all of the edges, then it's inside the polygon.
		return true;
	}

	throw new Error("assertion failed in containsPointShape");
};

// intersect, disregards entity color
export const intersectEntitySegment = (entity: Entity, segment: Segment) => {
	return intersectShapeSegment(entity.getShape(), segment);
};

////////////////////////////////////////////////////////////////////////////////
// private functions
////////////////////////////////////////////////////////////////////////////////

// INTERSECTIONS
const intersectSegments = (
	segment0: Segment,
	segment1: Segment,
	ref_segmentProportion0: { ref: number },
	ref_segmentProportion1: { ref: number },
	ref_contactPoint: { ref: Vector }
) => {
	const segStart0 = segment0.start;
	const segEnd0 = segment0.end;
	const segSize0 = segEnd0.sub(segStart0);
	const segStart1 = segment1.start;
	const segEnd1 = segment1.end;
	const segSize1 = segEnd1.sub(segStart1);

	// make sure these aren't parallel
	if (Math.abs(segSize0.dot(segSize1.flip())) < 0.000001) {
		return false;
	}

	// calculate the point of intersection...
	ref_segmentProportion0.ref =
		((segStart1.y - segStart0.y) * segSize1.x +
			(segStart0.x - segStart1.x) * segSize1.y) /
		(segSize0.y * segSize1.x - segSize1.y * segSize0.x);
	ref_segmentProportion1.ref =
		((segStart0.y - segStart1.y) * segSize0.x +
			(segStart1.x - segStart0.x) * segSize0.y) /
		(segSize1.y * segSize0.x - segSize0.y * segSize1.x);

	// where do these actually meet?
	ref_contactPoint.ref = segStart0.add(
		segSize0.mul(ref_segmentProportion0.ref)
	);

	// make sure the point of intersection is inside segment0
	if (ref_segmentProportion0.ref < 0 || ref_segmentProportion0.ref > 1) {
		return false;
	}

	// make sure the point of intersection is inside segment1
	if (ref_segmentProportion1.ref < 0 || ref_segmentProportion1.ref > 1) {
		return false;
	}

	// now that we've checked all this, the segments do intersect.
	return true;
};

const intersectCircleLine = (
	circle: Circle,
	line: Segment,
	ref_lineProportion0: { ref: number },
	ref_lineProportion1: { ref: number }
) => {
	// variables taken from http://local.wasp.uwa.edu.au/~pbourke/geometry/sphereline/
	// thanks, internet!

	const lineStart = line.start;
	const lineEnd = line.end;
	const lineSize = lineEnd.sub(lineStart);

	// find quadratic equation variables
	const a = lineSize.lengthSquared();
	const b = 2 * lineSize.dot(lineStart.sub(circle.center));
	const c =
		lineStart.sub(circle.center).lengthSquared() -
		circle.radius * circle.radius;

	const insideSqrt = b * b - 4 * a * c;
	if (insideSqrt < 0) {
		return false;
	}

	// calculate the point of intersection...
	ref_lineProportion0.ref = ((-b - Math.sqrt(insideSqrt)) * 0.5) / a;
	ref_lineProportion1.ref = ((-b + Math.sqrt(insideSqrt)) * 0.5) / a;

	return true;
};

const intersectShapeSegment = (shape: Shape, segment: Segment) => {
	if (isCircle(shape)) {
		return intersectCircleSegment(shape, segment);
	} else if (isAABB(shape)) {
		return intersectPolygonSegment(shape.getPolygon(), segment);
	} else if (isPolygon(shape)) {
		return intersectPolygonSegment(shape, segment);
	}

	alert("assertion failed in intersectShapeSegment");
};

const intersectCircleSegment = (circle: Circle, segment: Segment) => {
	const ref_lineProportion0: { ref: number } = { ref: 0 };
	const ref_lineProportion1: { ref: number } = { ref: 0 };
	if (
		!intersectCircleLine(
			circle,
			segment,
			ref_lineProportion0,
			ref_lineProportion1
		)
	) {
		return false;
	}

	if (ref_lineProportion0.ref >= 0 && ref_lineProportion0.ref <= 1) {
		return true;
	}

	return ref_lineProportion1.ref >= 0 && ref_lineProportion1.ref <= 1;
};

const intersectPolygonSegment = (polygon: Polygon, segment: Segment) => {
	// may fail on large enemies (if the segment is inside)

	const ref_segmentProportion0: { ref: number } = { ref: 0 };
	const ref_segmentProportion1: { ref: number } = { ref: 0 };
	const ref_contactPoint: { ref: Vector } = {} as { ref: Vector };
	for (let i = 0; i < polygon.vertices.length; i++) {
		if (
			intersectSegments(
				polygon.getSegment(i),
				segment,
				ref_segmentProportion0,
				ref_segmentProportion1,
				ref_contactPoint
			)
		) {
			return true;
		}
	}

	return false;
};

// COLLISIONS
const collideShapeSegment = (
	shape: Shape,
	deltaPosition: Vector,
	segment: Segment
) => {
	const segmentNormal = segment.normal;

	// if the shape isn't traveling into this edge, then it can't collide with it
	if (deltaPosition.dot(segmentNormal) > 0.0) {
		return null;
	}

	if (isCircle(shape)) {
		return collideCircleSegment(shape, deltaPosition, segment);
	} else if (isAABB(shape)) {
		return collidePolygonSegment(shape.getPolygon(), deltaPosition, segment);
	} else if (isPolygon(shape)) {
		return collidePolygonSegment(shape, deltaPosition, segment);
	}

	throw new Error("assertion failed in collideShapeSegment");
};

const collideCircleSegment = (
	circle: Circle,
	deltaPosition: Vector,
	segment: Segment
): Contact | null => {
	const segmentNormal = segment.normal;

	// a directed radius towards the segment
	const radiusToLine = segmentNormal.mul(-circle.radius);

	// position of this circle after being moved
	const newCircle = new Circle(circle.center.add(deltaPosition), circle.radius);

	// the point on the new circle farthest "in" this segment
	const newCircleInnermost = newCircle.center.add(radiusToLine);

	const endedInside =
		newCircleInnermost.sub(segment.start).dot(segmentNormal) < 0.001;

	// if the circle didn't end inside this segment, then it's not a collision.
	if (!endedInside) {
		return null;
	}

	// the point on the circle farthest "in" this segment, before moving
	const circleInnermost = newCircleInnermost.sub(deltaPosition);

	// did this circle start completely outside this segment?
	const startedOutside =
		circleInnermost.sub(segment.start).dot(segmentNormal) > 0;

	// if the circle started outside this segment, then it might have hit the flat part of this segment
	if (startedOutside) {
		const ref_segmentProportion: { ref: number } = {} as { ref: number };
		const ref_proportionOfDelta: { ref: number } = {} as { ref: number };
		const ref_contactPoint: { ref: Vector } = {} as { ref: Vector };
		if (
			intersectSegments(
				segment,
				new Segment(circleInnermost, newCircleInnermost),
				ref_segmentProportion,
				ref_proportionOfDelta,
				ref_contactPoint
			)
		) {
			// we can return this because the circle will always hit the flat part before it hits an end
			return {
				contactPoint: ref_contactPoint.ref,
				normal: segmentNormal,
				proportionOfDelta: ref_proportionOfDelta.ref,
			};
		}
	}

	// get the contacts that occurred when the edge of the circle hit an endpoint of this edge.
	const startContact = collideCirclePoint(circle, deltaPosition, segment.start);
	const endContact = collideCirclePoint(circle, deltaPosition, segment.end);

	// select the collision that occurred first
	if (!startContact && !endContact) {
		return null;
	}
	if (startContact && !endContact) {
		return startContact;
	}
	if (!startContact && endContact) {
		return endContact;
	}
	if (startContact!.proportionOfDelta < endContact!.proportionOfDelta) {
		return startContact;
	}
	return endContact;
};

const collideCirclePoint = (
	circle: Circle,
	deltaPosition: Vector,
	point: Vector
): Contact | null => {
	// deltaProportion1 is a throwaway
	// we can only use segmentProportion0 because segmentProportion1 represents the intersection
	// when the circle travels so that the point moves OUT of it, so we don't want to stop it from doing that.
	const ref_deltaProportion0: { ref: number } = {} as { ref: number };
	const ref_deltaProportion1: { ref: number } = {} as { ref: number };

	// BUGFIX: shock hawks were disappearing on Traps when deltaPosition was very small, which caused
	// us to try to solve a quadratic with a second order coefficient of zero and put NaNs everywhere
	const delta = deltaPosition.length();
	if (delta < 0.0000001) {
		return null;
	}

	// if these don't intersect at all, then forget about it.
	if (
		!intersectCircleLine(
			circle,
			new Segment(point, point.sub(deltaPosition)),
			ref_deltaProportion0,
			ref_deltaProportion1
		)
	) {
		return null;
	}

	// check that this actually happens inside of the segment.
	if (ref_deltaProportion0.ref < 0 || ref_deltaProportion0.ref > 1) {
		return null;
	}

	// find where the circle will be at the time of the collision
	const circleCenterWhenCollides = circle.center.add(
		deltaPosition.mul(ref_deltaProportion0.ref)
	);

	return {
		contactPoint: point,
		normal: circleCenterWhenCollides.sub(point).unit(),
		proportionOfDelta: ref_deltaProportion0.ref,
	};
};

const collidePolygonSegment = (
	polygon: Polygon,
	deltaPosition: Vector,
	segment: Segment
): Contact | null => {
	// use these for storing parameters about the collision.
	const ref_edgeProportion: { ref: number } = {} as { ref: number }; // throwaway
	const ref_deltaProportion: { ref: number } = {} as { ref: number }; // how far into the timestep we get before colliding
	const ref_contactPoint: { ref: Vector } = {} as { ref: Vector }; // where we collide

	// if this was touching the segment before, NO COLLISION
	if (intersectPolygonSegment(polygon, segment)) {
		return null;
	}

	// the first instance of contact
	let firstContact: Contact | null = null;
	let i;

	// for each side of the polygon, check the edge's endpoints for a collision
	for (i = 0; i < polygon.vertices.length; i++) {
		const edgeEndpoints = [segment.start, segment.end];
		const edgeMiddle = segment.start.add(segment.end).div(2);

		// for each endpoint of the edge
		for (let j = 0; j < 2; j++) {
			const polygonSegment = polygon.getSegment(i);
			// if the polygon is trying to pass out of the edge, no collision
			if (polygonSegment.normal.dot(edgeEndpoints[j].sub(edgeMiddle)) > 0) {
				continue;
			}

			// if these don't intersect, ignore this edge
			if (
				!intersectSegments(
					polygonSegment,
					new Segment(edgeEndpoints[j], edgeEndpoints[j].sub(deltaPosition)),
					ref_edgeProportion,
					ref_deltaProportion,
					ref_contactPoint
				)
			) {
				continue;
			}

			// if this contact is sooner, or if there wasn't one before, then we'll use this one
			if (
				!firstContact ||
				ref_deltaProportion.ref < firstContact.proportionOfDelta
			) {
				firstContact = {
					contactPoint: ref_contactPoint.ref,
					normal: polygonSegment.normal.mul(-1),
					proportionOfDelta: ref_deltaProportion.ref,
				};
			}
		}
	}

	// for each point of the polygon, check for a collision
	for (i = 0; i < polygon.vertices.length; i++) {
		const vertex = polygon.getVertex(i);
		// if these don't intersect, ignore this edge
		if (
			!intersectSegments(
				segment,
				new Segment(vertex, vertex.add(deltaPosition)),
				ref_edgeProportion,
				ref_deltaProportion,
				ref_contactPoint
			)
		) {
			continue;
		}

		// if this contact is sooner, or if there wasn't one before, then we'll use this one
		if (
			!firstContact ||
			ref_deltaProportion.ref < firstContact.proportionOfDelta
		) {
			firstContact = {
				contactPoint: ref_contactPoint.ref,
				normal: segment.normal,
				proportionOfDelta: ref_deltaProportion.ref,
			};
		}
	}

	// return the first instance of contact
	return firstContact;
};

// EMERGENCY COLLISIONS, PREVENTS FALLING THROUGH FLOORS
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

// OVERLAPS
const overlapShapes = (shape0: Shape, shape1: Shape) => {
	let shapeTempPointer = null;
	let shape0Pointer = shape0.copy();
	let shape1Pointer = shape1.copy();

	// convert aabb's to polygons
	if (isAABB(shape0Pointer)) {
		shapeTempPointer = shape0Pointer;
		shape0Pointer = shape0Pointer.getPolygon();
	}
	if (isAABB(shape1Pointer)) {
		shapeTempPointer = shape1Pointer;
		shape1Pointer = shape1Pointer.getPolygon();
	}

	// swap the shapes so that they're in order
	if (shape0Pointer.getType() > shape1Pointer.getType()) {
		shapeTempPointer = shape1Pointer;
		shape1Pointer = shape0Pointer;
		shape0Pointer = shapeTempPointer;
	}

	let result;

	// if they're both circles
	if (isCircle(shape0Pointer) && isCircle(shape1Pointer)) {
		result = overlapCircles(shape0Pointer, shape1Pointer);
	}

	// if one is a circle and one is a polygon
	else if (isCircle(shape0Pointer) && isPolygon(shape1Pointer)) {
		result = overlapCirclePolygon(shape0Pointer, shape1Pointer);
	}

	// if both are polygons
	else if (isPolygon(shape0Pointer) && isPolygon(shape1Pointer)) {
		result = overlapPolygons(shape0Pointer, shape1Pointer);
	}

	// we would only get here if we received an impossible pair of shapes.
	else {
		alert("assertion failed in CollisionDetector.overlapShapes");
	}

	return result;
};

const overlapCircles = (circle0: Circle, circle1: Circle) => {
	return (
		circle1.getCenter().sub(circle0.getCenter()).lengthSquared() <=
		(circle0.radius + circle1.radius) * (circle0.radius + circle1.radius)
	);
};

const overlapCirclePolygon = (circle: Circle, polygon: Polygon) => {
	// see if any point on the border of the the polygon is in the circle
	const len = polygon.vertices.length;
	for (let i = 0; i < len; ++i) {
		// if a segment of the polygon crosses the edge of the circle
		if (intersectCircleSegment(circle, polygon.getSegment(i))) {
			return true;
		}

		// if a vertex of the polygon is inside the circle
		if (
			polygon.getVertex(i).sub(circle.center).lengthSquared() <
			circle.radius * circle.radius
		) {
			return true;
		}
	}

	// otherwise, the circle could be completely inside the polygon
	const point = circle.center;
	for (let i = 0; i < len; ++i) {
		// Is this point outside this edge?  if so, it's not inside the polygon
		if (
			point
				.sub(polygon.vertices[i].add(polygon.center))
				.dot(polygon.segments[i].normal) > 0
		) {
			return false;
		}
	}
	// if the point was inside all of the edges, then it's inside the polygon.
	return true;
};

const overlapPolygons = (polygon0: Polygon, polygon1: Polygon) => {
	let i;
	const len0 = polygon0.vertices.length;
	const len1 = polygon1.vertices.length;

	// see if any corner of polygon 0 is inside of polygon 1
	for (i = 0; i < len0; ++i) {
		if (
			containsPointPolygon(polygon0.vertices[i].add(polygon0.center), polygon1)
		) {
			return true;
		}
	}

	// see if any corner of polygon 1 is inside of polygon 0
	for (i = 0; i < len1; ++i) {
		if (
			containsPointPolygon(polygon1.vertices[i].add(polygon1.center), polygon0)
		) {
			return true;
		}
	}

	return false;
};

// CONTAINS
const containsPointPolygon = (point: Vector, polygon: Polygon) => {
	const len = polygon.vertices.length;
	for (let i = 0; i < len; ++i) {
		// Is this point outside this edge?  if so, it's not inside the polygon
		if (
			point
				.sub(polygon.vertices[i].add(polygon.center))
				.dot(polygon.segments[i].normal) > 0
		) {
			return false;
		}
	}
	// if the point was inside all of the edges, then it's inside the polygon.
	return true;
};

// DISTANCES
const distanceShapeSegment = (shape: Shape, segment: Segment) => {
	// if the two are intersecting, the distance is obviously 0
	if (intersectShapeSegment(shape, segment)) {
		return 0;
	}

	return closestToShapeSegment(
		shape,
		{} as { ref: Vector },
		{} as { ref: Vector },
		segment
	);
};

// CLOSEST TO

const closestToShapeSegment = (
	shape: Shape,
	ref_shapePoint: { ref: Vector },
	ref_segmentPoint: { ref: Vector },
	segment: Segment
) => {
	if (isCircle(shape)) {
		return closestToCircleSegment(
			shape,
			ref_shapePoint,
			ref_segmentPoint,
			segment
		);
	} else if (isAABB(shape)) {
		return closestToPolygonSegment(
			shape.getPolygon(),
			ref_shapePoint,
			ref_segmentPoint,
			segment
		);
	} else if (isPolygon(shape)) {
		return closestToPolygonSegment(
			shape,
			ref_shapePoint,
			ref_segmentPoint,
			segment
		);
	}

	throw new Error(
		"assertion failed in CollisionDetector.closestToShapeSegment"
	);
};

const closestToCircleSegment = (
	circle: Circle,
	ref_shapePoint: { ref: Vector },
	ref_segmentPoint: { ref: Vector },
	segment: Segment
) => {
	// see if the closest point is in the middle of the segment
	const ref_segmentProportion: { ref: number } = {} as { ref: number };
	const ref_projectProportion: { ref: number } = {} as { ref: number };
	intersectSegments(
		segment,
		new Segment(circle.center, circle.center.sub(segment.normal)),
		ref_segmentProportion,
		ref_projectProportion,
		ref_segmentPoint
	);

	// if the closest point is in the middle of the segment
	if (ref_segmentProportion.ref >= 0 && ref_segmentProportion.ref <= 1) {
		// this returns the distance of the circle from the segment, along the normal
		// since the normal is a unit vector and is also the shortest path, this works.
		ref_shapePoint.ref = circle.center.sub(
			segment.normal.mul(
				circle.radius * (ref_projectProportion.ref > 0 ? 1 : -1)
			)
		);
		return ref_segmentPoint.ref.sub(circle.center).length() - circle.radius;
	}

	// otherwise, the closest point is one of the ends
	const distanceSquaredToStart = circle.center
		.sub(segment.start)
		.lengthSquared();
	const distanceSquaredToEnd = circle.center.sub(segment.end).lengthSquared();

	// if the start is closer, use it
	if (distanceSquaredToStart < distanceSquaredToEnd) {
		ref_segmentPoint.ref = segment.start;
		// this was WAY off in the version before the port, was relative to circle.center instead of absolute:
		ref_shapePoint.ref = circle.center.add(
			ref_segmentPoint.ref.sub(circle.center).unit().mul(circle.radius)
		);
		return Math.sqrt(distanceSquaredToStart) - circle.radius;
	}

	// otherwise, the end is closer
	ref_segmentPoint.ref = segment.end;
	// this was WAY off in the version before the port, was relative to circle.center instead of absolute:
	ref_shapePoint.ref = circle.center.add(
		ref_segmentPoint.ref.sub(circle.center).unit().mul(circle.radius)
	);
	return Math.sqrt(distanceSquaredToEnd) - circle.radius;
};

const closestToPolygonSegment = (
	polygon: Polygon,
	ref_shapePoint: { ref: Vector },
	ref_segmentPoint: { ref: Vector },
	segment: Segment
) => {
	let distance = Number.POSITIVE_INFINITY;
	let thisDistance;

	// check every pair of points for distance
	for (let i = 0; i < polygon.vertices.length; i++) {
		const polygonPoint = polygon.getVertex(i);

		for (let j = 0; j < 2; j++) {
			const thisSegmentPoint = j === 0 ? segment.start : segment.end;
			thisDistance = polygonPoint.sub(thisSegmentPoint).length();

			if (thisDistance < distance) {
				distance = thisDistance;
				ref_segmentPoint.ref = thisSegmentPoint;
				ref_shapePoint.ref = polygonPoint;
			}
		}
	}

	const ref_edgeProportion: { ref: number } = {} as { ref: number };
	const ref_polygonDistanceProportion: { ref: number } = {} as { ref: number };
	const ref_closestPoint: { ref: Vector } = {} as { ref: Vector };

	// see how close each vertex of the polygon is to a point in the middle of the edge
	for (let i = 0; i < polygon.vertices.length; i++) {
		const polygonPoint = polygon.getVertex(i);

		// find where this polygon vertex projects onto the edge
		intersectSegments(
			segment,
			new Segment(polygonPoint, polygonPoint.sub(segment.normal)),
			ref_edgeProportion,
			ref_polygonDistanceProportion,
			ref_closestPoint
		);

		// if this projects beyond the endpoints of the edge, ignore it
		if (ref_edgeProportion.ref < 0 || ref_edgeProportion.ref > 1) {
			continue;
		}

		// the distance along the normal of the segment from the segment to this vertex of the polygon
		thisDistance = Math.abs(ref_polygonDistanceProportion.ref);

		// if this is the closest we've found, use this
		if (thisDistance < distance) {
			distance = thisDistance;
			ref_segmentPoint.ref = ref_closestPoint.ref;
			ref_shapePoint.ref = polygonPoint;
		}
	}

	const ref_polygonEdgeProportion: { ref: number } = {} as { ref: number };
	const ref_distanceProportion: { ref: number } = {} as { ref: number };

	// see how close each endpoint of the segment is to a point on the middle of a polygon edge
	for (let i = 0; i < polygon.vertices.length; i++) {
		const polygonSegment = polygon.getSegment(i);

		for (let j = 0; j < 2; j++) {
			const thisSegmentPoint = j === 0 ? segment.start : segment.end;

			// find where this segment endpoint projects onto the polygon edge
			intersectSegments(
				polygonSegment,
				new Segment(
					thisSegmentPoint,
					thisSegmentPoint.add(polygonSegment.normal)
				),
				ref_polygonEdgeProportion,
				ref_distanceProportion,
				ref_closestPoint
			);

			// if this projects beyond the endpoints of the polygon's edge, ignore it
			if (
				ref_polygonEdgeProportion.ref < 0 ||
				ref_polygonEdgeProportion.ref > 1
			) {
				continue;
			}

			thisDistance = Math.abs(ref_distanceProportion.ref);

			if (thisDistance < distance) {
				distance = thisDistance;
				ref_segmentPoint.ref = thisSegmentPoint;
				ref_shapePoint.ref = ref_closestPoint.ref;
			}
		}
	}

	return distance;
};

// PENETRATIONS
const penetrationEntityWorld = (
	entity: Entity,
	edgeQuad: EdgeQuad,
	world: World
) => {
	const shape = entity.getShape();

	edgeQuad.nullifyEdges();

	const edges = world.getEdgesInAabb(
		shape.getAabb().expand(0.1),
		entity.getColor()
	);
	for (let it = 0; it < edges.length; it++) {
		// if the polygon isn't close to this segment, forget about it
		const thisDistance = distanceShapeSegment(shape, edges[it].segment);
		if (thisDistance > 0.01) {
			continue;
		}

		// if the penetration is negative, ignore this segment
		const thisPenetration = penetrationShapeSegment(shape, edges[it].segment);
		if (thisPenetration < 0) {
			continue;
		}

		edgeQuad.minimize(edges[it], thisPenetration);
	}
};

const penetrationShapeSegment = (shape: Shape, segment: Segment) => {
	if (isCircle(shape)) {
		return penetrationCircleSegment(shape, segment);
	} else if (isAABB(shape)) {
		return penetrationPolygonSegment(shape.getPolygon(), segment);
	} else if (isPolygon(shape)) {
		return penetrationPolygonSegment(shape, segment);
	}

	throw new Error(
		"assertion failed in CollisionDetector.penetrationShapeSegment"
	);
};

const penetrationCircleSegment = (circle: Circle, segment: Segment) => {
	// a directed radius towards the segment
	const radiusToLine = segment.normal.mul(-circle.radius);

	// position on the circle closest to the inside of the line
	const innermost = circle.center.add(radiusToLine);

	// map this onto the normal.
	return innermost.sub(segment.start).dot(segment.normal);
};

const penetrationPolygonSegment = (polygon: Polygon, segment: Segment) => {
	let innermost = Number.POSITIVE_INFINITY;
	const ref_edgeProportion: { ref: number } = {} as { ref: number };
	const ref_penetrationProportion: { ref: number } = {} as { ref: number };
	const ref_closestPointOnSegment: { ref: Vector } = {} as { ref: Vector };

	// check the penetration of each vertex of the polygon
	for (let i = 0; i < polygon.vertices.length; i++) {
		const vertex = polygon.getVertex(i);
		// find where this polygon point projects onto the segment
		intersectSegments(
			segment,
			new Segment(vertex, vertex.sub(segment.normal)),
			ref_edgeProportion,
			ref_penetrationProportion,
			ref_closestPointOnSegment
		);

		// if this point projects onto the segment outside of its endpoints, don't consider this point to be projected
		// into this edge
		if (ref_edgeProportion.ref < 0 || ref_edgeProportion.ref > 1) {
			continue;
		}

		// the penetration of this vertex
		if (ref_penetrationProportion.ref < innermost) {
			innermost = ref_penetrationProportion.ref;
		}
	}

	return innermost;
};
