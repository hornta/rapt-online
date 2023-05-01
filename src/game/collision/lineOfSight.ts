import { AABB } from "../aabb";
import { EDGE_ENEMIES } from "../constants";
import { Segment } from "../segment";
import { Vector } from "../vector";
import { World } from "../world";
import { intersectSegments } from "./intersect/intersectSegments";

const MAX_LOS_DISTANCE_SQUARED = 625;

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
