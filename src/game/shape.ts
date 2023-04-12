import { AABB } from "./aabb";
import { Vector } from "./vector";

export interface Shape {
	getCenter(): Vector;

	moveTo(destination: Vector): void;

	copy(): Shape;

	moveBy(delta: Vector): void;

	getAabb(): AABB;

	getType(): number;
}
