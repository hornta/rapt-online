import { AABB } from "./aabb.js";
import { Vector } from "./vector.js";

export interface Shape {
	getCenter(): Vector;

	moveTo(destination: Vector): void;

	copy(): Shape;

	moveBy(delta: Vector): void;

	getAabb(): AABB;

	getType(): number;
}
