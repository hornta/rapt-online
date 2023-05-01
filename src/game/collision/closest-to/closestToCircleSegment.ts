import { Circle } from "@/game/circle";
import { Segment } from "@/game/segment";
import { Vector } from "@/game/vector";
import { intersectSegments } from "../intersect/intersectSegments";

export const closestToCircleSegment = (
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
