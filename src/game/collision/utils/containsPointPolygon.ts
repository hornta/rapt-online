import { Polygon } from "../../polygon";
import { Vector } from "../../vector";

export const containsPointPolygon = (point: Vector, polygon: Polygon) => {
	const len = polygon.vertices.length;
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
