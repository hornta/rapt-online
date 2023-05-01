import { Segment } from "@/game/segment";
import { Shape } from "@/game/shape";
import { Vector } from "@/game/vector";
import { closestToShapeSegment } from "../closest-to/closestToShapeSegment";
import { intersectShapeSegment } from "../intersect/intersectShapeSegment";

export const distanceShapeSegment = (shape: Shape, segment: Segment) => {
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
