import { Polygon } from "@/game/polygon";
import { Segment } from "@/game/segment";
import { Vector } from "@/game/vector";
import { intersectSegments } from "./intersectSegments";

export const intersectPolygonSegment = (polygon: Polygon, segment: Segment) => {
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
