import { Vector } from "./vector";

export interface Contact {
	proportionOfDelta: number;
	contactPoint: Vector;
	normal: Vector;
}
