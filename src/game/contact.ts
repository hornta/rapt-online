import { Vector } from "./vector.js";

export interface Contact {
	proportionOfDelta: number;
	contactPoint: Vector;
	normal: Vector;
}
