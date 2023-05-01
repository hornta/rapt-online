import { isAABB } from "@/game/aabb";
import { isCircle } from "@/game/circle";
import { isPolygon } from "@/game/polygon";
import { Segment } from "@/game/segment";
import { Shape } from "@/game/shape";
import { penetrationCircleSegment } from "./penetrationCircleSegment";
import { penetrationPolygonSegment } from "./penetrationPolygonSegment";

export const penetrationShapeSegment = (shape: Shape, segment: Segment) => {
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
