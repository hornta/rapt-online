import { EdgeQuad } from "../edgeQuad";
import { Entity } from "../entity";
import { World } from "../world";
import { penetrationEntityWorld } from "./penetration/penetrationEntityWorld";

const ON_MARGIN = 0.01;

export const onEntityWorld = (
	entity: Entity,
	edgeQuad: EdgeQuad,
	world: World
) => {
	penetrationEntityWorld(entity, edgeQuad, world);
	edgeQuad.throwOutIfGreaterThan(ON_MARGIN);
};
