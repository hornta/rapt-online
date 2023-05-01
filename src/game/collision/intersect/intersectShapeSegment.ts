import { isAABB } from "@/game/aabb";
import { isCircle } from "@/game/circle";
import { isPolygon } from "@/game/polygon";
import { Segment } from "@/game/segment";
import { Shape } from "@/game/shape";
import { intersectCircleSegment } from "./intersectCircleSegment";
import { intersectPolygonSegment } from "./intersectPolygonSegment";

export const intersectShapeSegment = (shape: Shape, segment: Segment) => {
	if (isCircle(shape)) {
		return intersectCircleSegment(shape, segment);
	} else if (isAABB(shape)) {
		return intersectPolygonSegment(shape.getPolygon(), segment);
	} else if (isPolygon(shape)) {
		return intersectPolygonSegment(shape, segment);
	}

	alert("assertion failed in intersectShapeSegment");
};
