import { Polygon } from "@/game/polygon";
import { Segment } from "@/game/segment";
import { Vector } from "@/game/vector";
import { intersectSegments } from "../intersect/intersectSegments";

export const penetrationPolygonSegment = (
	polygon: Polygon,
	segment: Segment
) => {
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
