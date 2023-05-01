import { Vector } from "@/game/vector";
import { World } from "@/game/world";
import { closestToShapeSegment } from "./closestToShapeSegment";
import { Entity } from "@/game/entity";

export const closestToEntityWorld = (
	entity: Entity,
	radius: number,
	ref_shapePoint: { ref: Vector },
	ref_worldPoint: { ref: Vector },
	world: World
) => {
	const shape = entity.getShape();
	const boundingBox = shape.getAabb().expand(radius);
	const edges = world.getEdgesInAabb(boundingBox, entity.getColor());

	let distance = Number.POSITIVE_INFINITY;
	for (const edge of edges) {
		const ref_thisShapePoint: { ref: Vector } = {} as { ref: Vector };
		const ref_thisWorldPoint: { ref: Vector } = {} as { ref: Vector };
		const thisDistance = closestToShapeSegment(
			shape,
			ref_thisShapePoint,
			ref_thisWorldPoint,
			edge.segment
		);
		if (thisDistance < distance) {
			distance = thisDistance;
			ref_shapePoint.ref = ref_thisShapePoint.ref;
			ref_worldPoint.ref = ref_thisWorldPoint.ref;
		}
	}
	return distance;
};
