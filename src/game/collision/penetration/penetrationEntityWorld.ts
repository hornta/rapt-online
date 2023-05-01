import { EdgeQuad } from "@/game/edgeQuad";
import { World } from "@/game/world";
import { penetrationShapeSegment } from "./penetrationShapeSegment";
import { Entity } from "@/game/entity";
import { distanceShapeSegment } from "../utils/distanceShapeSegment";

export const penetrationEntityWorld = (
	entity: Entity,
	edgeQuad: EdgeQuad,
	world: World
) => {
	const shape = entity.getShape();

	edgeQuad.nullifyEdges();

	const edges = world.getEdgesInAabb(
		shape.getAabb().expand(0.1),
		entity.getColor()
	);
	for (let it = 0; it < edges.length; it++) {
		// if the polygon isn't close to this segment, forget about it
		const thisDistance = distanceShapeSegment(shape, edges[it].segment);
		if (thisDistance > 0.01) {
			continue;
		}

		// if the penetration is negative, ignore this segment
		const thisPenetration = penetrationShapeSegment(shape, edges[it].segment);
		if (thisPenetration < 0) {
			continue;
		}

		edgeQuad.minimize(edges[it], thisPenetration);
	}
};
