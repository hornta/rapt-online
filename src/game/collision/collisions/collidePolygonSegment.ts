import { Contact } from "@/game/contact";
import { Polygon } from "@/game/polygon";
import { Segment } from "@/game/segment";
import { Vector } from "@/game/vector";
import { intersectPolygonSegment } from "../intersect/intersectPolygonSegment";
import { intersectSegments } from "../intersect/intersectSegments";

export const collidePolygonSegment = (
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
