import { isAABB } from "@/game/aabb";
import { isCircle } from "@/game/circle";
import { isPolygon } from "@/game/polygon";
import { Segment } from "@/game/segment";
import { Shape } from "@/game/shape";
import { Vector } from "@/game/vector";
import { closestToCircleSegment } from "./closestToCircleSegment";
import { closestToPolygonSegment } from "./closestToPolygonSegment";

export const closestToShapeSegment = (
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
