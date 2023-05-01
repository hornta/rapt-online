import { Circle } from "@/game/circle";
import { Polygon } from "@/game/polygon";
import { intersectCircleSegment } from "../intersect/intersectCircleSegment";

export const overlapCirclePolygon = (circle: Circle, polygon: Polygon) => {
	// see if any point on the border of the the polygon is in the circle
	const len = polygon.vertices.length;
	for (let i = 0; i < len; ++i) {
		// if a segment of the polygon crosses the edge of the circle
		if (intersectCircleSegment(circle, polygon.getSegment(i))) {
			return true;
		}

		// if a vertex of the polygon is inside the circle
		if (
			polygon.getVertex(i).sub(circle.center).lengthSquared() <
			circle.radius * circle.radius
		) {
			return true;
		}
	}

	// otherwise, the circle could be completely inside the polygon
	const point = circle.center;
	for (let i = 0; i < len; ++i) {
		// Is this point outside this edge?  if so, it's not inside the polygon
		if (
			point
				.sub(polygon.vertices[i].add(polygon.center))
				.dot(polygon.segments[i].normal) > 0
		) {
			return false;
		}
	}
	// if the point was inside all of the edges, then it's inside the polygon.
	return true;
};
