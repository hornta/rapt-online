import { Polygon } from "@/game/polygon";
import { Segment } from "@/game/segment";
import { Vector } from "@/game/vector";
import { intersectSegments } from "../intersect/intersectSegments";

export const closestToPolygonSegment = (
	polygon: Polygon,
	ref_shapePoint: { ref: Vector },
	ref_segmentPoint: { ref: Vector },
	segment: Segment
) => {
	let distance = Number.POSITIVE_INFINITY;
	let thisDistance;

	// check every pair of points for distance
	for (let i = 0; i < polygon.vertices.length; i++) {
		const polygonPoint = polygon.getVertex(i);

		for (let j = 0; j < 2; j++) {
			const thisSegmentPoint = j === 0 ? segment.start : segment.end;
			thisDistance = polygonPoint.sub(thisSegmentPoint).length();

			if (thisDistance < distance) {
				distance = thisDistance;
				ref_segmentPoint.ref = thisSegmentPoint;
				ref_shapePoint.ref = polygonPoint;
			}
		}
	}

	const ref_edgeProportion: { ref: number } = {} as { ref: number };
	const ref_polygonDistanceProportion: { ref: number } = {} as { ref: number };
	const ref_closestPoint: { ref: Vector } = {} as { ref: Vector };

	// see how close each vertex of the polygon is to a point in the middle of the edge
	for (let i = 0; i < polygon.vertices.length; i++) {
		const polygonPoint = polygon.getVertex(i);

		// find where this polygon vertex projects onto the edge
		intersectSegments(
			segment,
			new Segment(polygonPoint, polygonPoint.sub(segment.normal)),
			ref_edgeProportion,
			ref_polygonDistanceProportion,
			ref_closestPoint
		);

		// if this projects beyond the endpoints of the edge, ignore it
		if (ref_edgeProportion.ref < 0 || ref_edgeProportion.ref > 1) {
			continue;
		}

		// the distance along the normal of the segment from the segment to this vertex of the polygon
		thisDistance = Math.abs(ref_polygonDistanceProportion.ref);

		// if this is the closest we've found, use this
		if (thisDistance < distance) {
			distance = thisDistance;
			ref_segmentPoint.ref = ref_closestPoint.ref;
			ref_shapePoint.ref = polygonPoint;
		}
	}

	const ref_polygonEdgeProportion: { ref: number } = {} as { ref: number };
	const ref_distanceProportion: { ref: number } = {} as { ref: number };

	// see how close each endpoint of the segment is to a point on the middle of a polygon edge
	for (let i = 0; i < polygon.vertices.length; i++) {
		const polygonSegment = polygon.getSegment(i);

		for (let j = 0; j < 2; j++) {
			const thisSegmentPoint = j === 0 ? segment.start : segment.end;

			// find where this segment endpoint projects onto the polygon edge
			intersectSegments(
				polygonSegment,
				new Segment(
					thisSegmentPoint,
					thisSegmentPoint.add(polygonSegment.normal)
				),
				ref_polygonEdgeProportion,
				ref_distanceProportion,
				ref_closestPoint
			);

			// if this projects beyond the endpoints of the polygon's edge, ignore it
			if (
				ref_polygonEdgeProportion.ref < 0 ||
				ref_polygonEdgeProportion.ref > 1
			) {
				continue;
			}

			thisDistance = Math.abs(ref_distanceProportion.ref);

			if (thisDistance < distance) {
				distance = thisDistance;
				ref_segmentPoint.ref = thisSegmentPoint;
				ref_shapePoint.ref = ref_closestPoint.ref;
			}
		}
	}

	return distance;
};
