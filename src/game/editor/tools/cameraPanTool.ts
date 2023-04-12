import { Vector } from "../../vector";
import { Tool } from "./tool";

export class CameraPanTool extends Tool {
	worldCenter: Vector;
	oldPoint: Vector;

	constructor(worldCenter: Vector) {
		super();

		this.worldCenter = worldCenter;
		this.oldPoint = new Vector(0, 0);
	}

	mouseDown(point: Vector) {
		this.oldPoint = point;
	}

	mouseMoved(point: Vector) {
		// Cannot set this.worldCenter directly because that wouldn't modify the original object
		this.worldCenter.x -= point.x - this.oldPoint.x;
		this.worldCenter.y -= point.y - this.oldPoint.y;
	}

	mouseUp() {}

	draw() {}
}
