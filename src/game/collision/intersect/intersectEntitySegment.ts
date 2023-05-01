import { Segment } from "@/game/segment";
import { intersectShapeSegment } from "./intersectShapeSegment";
import { Entity } from "@/game/entity";

export const intersectEntitySegment = (entity: Entity, segment: Segment) => {
	return intersectShapeSegment(entity.getShape(), segment);
};
