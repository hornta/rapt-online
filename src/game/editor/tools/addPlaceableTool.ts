import { Vector } from "../../vector.js";
import { Document } from "../document.js";
import { Editor } from "../editor.js";
import { Button } from "../placeables/button.js";
import { SPRITE_SIGN, Sprite } from "../placeables/sprite.js";
import { Tool } from "./tool.js";

export class AddPlaceableTool extends Tool {
	doc: Document;
	placeableTemplate: Sprite | Button;
	point: null | Vector;

	constructor(doc: Document, placeableTemplate: Sprite | Button) {
		super();

		this.doc = doc;
		this.placeableTemplate = placeableTemplate;
		this.point = null;
	}

	mouseDown(point: Vector, editor: Editor) {
		this.mouseMoved(point);

		const placeable = this.placeableTemplate.clone(
			this.point!,
			"color" in this.placeableTemplate
				? this.placeableTemplate.color
				: undefined
		);
		this.doc.addPlaceable(placeable);

		if (
			"id" in this.placeableTemplate &&
			this.placeableTemplate.id === SPRITE_SIGN
		) {
			this.doc.setSelection([placeable]);
			const text = prompt("Text");
			if (text !== null) {
				this.doc.setSignText(placeable as Sprite, text);
				editor.draw();
			}
		}
	}

	mouseMoved(point: Vector) {
		this.point = point;
	}

	mouseUp() {}

	draw(c: CanvasRenderingContext2D) {
		if (this.point !== null) {
			this.placeableTemplate
				.clone(
					this.point,
					"color" in this.placeableTemplate
						? this.placeableTemplate.color
						: undefined
				)
				.draw(c, 0.5);
		}
	}
}
