import { isAABB } from "@/game/aabb";
import { isCircle } from "@/game/circle";
import { isPolygon } from "@/game/polygon";
import { Segment } from "@/game/segment";
import { Shape } from "@/game/shape";
import { Vector } from "@/game/vector";
import { collideCircleSegment } from "./collideCircleSegment";
import { collidePolygonSegment } from "./collidePolygonSegment";

export const collideShapeSegment = (
	shape: Shape,
	deltaPosition: Vector,
	segment: Segment
) => {
	// if the shape isn't traveling into this edge, then it can't collide with it
	if (deltaPosition.dot(segment.normal) > 0.0) {
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
