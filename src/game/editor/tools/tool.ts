import { Vector } from "../../vector.js";
import { Editor } from "../editor.js";

export abstract class Tool {
	modifierKeyPressed: boolean;

	abstract draw(c: CanvasRenderingContext2D): void;
	abstract mouseDown(point: Vector, editor: Editor): void;
	abstract mouseMoved(point: Vector): void;
	abstract mouseUp(point: Vector): void;
}
