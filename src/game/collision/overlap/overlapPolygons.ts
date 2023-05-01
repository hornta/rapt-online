import { Polygon } from "@/game/polygon";
import { containsPointPolygon } from "../utils/containsPointPolygon";

export const overlapPolygons = (polygon0: Polygon, polygon1: Polygon) => {
	let i;
	const len0 = polygon0.vertices.length;
	const len1 = polygon1.vertices.length;

	// see if any corner of polygon 0 is inside of polygon 1
	for (i = 0; i < len0; ++i) {
		if (
			containsPointPolygon(polygon0.vertices[i].add(polygon0.center), polygon1)
		) {
			return true;
		}
	}

	// see if any corner of polygon 1 is inside of polygon 0
	for (i = 0; i < len1; ++i) {
		if (
			containsPointPolygon(polygon1.vertices[i].add(polygon1.center), polygon0)
		) {
			return true;
		}
	}

	return false;
};
