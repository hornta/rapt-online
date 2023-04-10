import { Vector } from "../../vector.js";
import { Rectangle } from "../shapes.js";

export type PlaceableType = "button" | "door" | "sprite" | "link";

export abstract class BasePlaceable {
	placeableType: PlaceableType;
	selected = false;
	anchor: Vector | null;
	angle: number;

	constructor(type: PlaceableType, anchor: Vector | null, angle: number) {
		this.placeableType = type;
		this.anchor = anchor;
		this.angle = angle;
	}

	abstract draw(c: CanvasRenderingContext2D, alpha: number): void;
	abstract drawSelection(c: CanvasRenderingContext2D): void;
	getCenter() {
		return this.anchor;
	}

	getAnchor() {
		return this.anchor;
	}

	setAnchor(anchor: Vector) {
		this.anchor = anchor;
	}

	abstract touchesRect(rect: Rectangle): boolean;

	getAngle() {
		return 0;
	}

	setAngle(angle: number) {
		this.angle = angle;
	}

	resetAnchor() {}
}
