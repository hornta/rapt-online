import { isAABB } from "@/game/aabb";
import { isCircle } from "@/game/circle";
import { isPolygon } from "@/game/polygon";
import { Shape } from "@/game/shape";
import { Vector } from "@/game/vector";

export const containsPointShape = (point: Vector, shape: Shape) => {
	if (isCircle(shape)) {
		return (
			point.sub(shape.center).lengthSquared() < shape.radius * shape.radius
		);
	} else if (isAABB(shape)) {
		return (
			point.x >= shape.lowerLeft.x &&
			point.x <= shape.lowerLeft.x + shape.size.x &&
			point.y >= shape.lowerLeft.y &&
			point.y <= shape.lowerLeft.y + shape.size.y
		);
	} else if (isPolygon(shape)) {
		const len = shape.vertices.length;
		for (let i = 0; i < len; ++i) {
			// Is this point outside this edge?  if so, it's not inside the polygon
			if (
				point
					.sub(shape.vertices[i].add(shape.center))
					.dot(shape.segments[i].normal) > 0
			) {
				return false;
			}
		}
		// if the point was inside all of the edges, then it's inside the polygon.
		return true;
	}

	throw new Error("assertion failed in containsPointShape");
};
