import { rgba } from "../../utils.js";
import { Vector } from "../../vector.js";
import { Circle, Rectangle } from "../shapes.js";
import { drawButton } from "../sprites.js";
import { BasePlaceable } from "./placeable.js";

export class Button extends BasePlaceable {
	type: 0 | 1 | 2;

	constructor(anchor: Vector | null, type: 0 | 1 | 2) {
		super("button", anchor, 0);

		this.type = type;
	}

	draw(c: CanvasRenderingContext2D, alpha: number) {
		const text = ["Open", "Close", "Toggle"][this.type];
		c.save();
		c.translate(this.anchor!.x, this.anchor!.y);
		drawButton(c, alpha || 1);
		c.fillStyle = rgba(0, 0, 0, alpha || 1);
		c.scale(1 / 150, -1 / 150);
		c.font = '15px "Lucida Grande", Helvetica, Arial, sans-serif';
		c.fillText(text, -c.measureText(text).width / 2, 35);
		c.restore();
	}

	drawSelection(c: CanvasRenderingContext2D) {
		c.beginPath();
		c.arc(this.anchor!.x, this.anchor!.y, 0.3, 0, Math.PI * 2, false);
		c.closePath();
		c.fill();
		c.stroke();
	}

	touchesRect(rect: Rectangle) {
		return new Circle(this.anchor!, 0.11).intersectsRect(rect);
	}

	clone(newAnchor: Vector) {
		return new Button(newAnchor, this.type);
	}

	setAngle() {}
}
