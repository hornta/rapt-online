import { Button } from "../placeables/button";
import { Tool } from "./tool";
import { Document } from "../document";
import { Vector } from "../../vector";
import { Door } from "../placeables/door";
import { Link } from "../placeables/link";
import { dashedLine, rgba } from "../../utils";

export class LinkButtonToDoorTool extends Tool {
	doc: Document;
	from: Button | Door | null;
	to: Button | Door | null;
	isLinking: boolean;
	isValidLink: boolean;

	constructor(doc: Document) {
		super();

		this.doc = doc;
		this.from = null;
		this.to = null;
		this.isLinking = false;
		this.isValidLink = false;
	}

	mouseDown(point: Vector) {
		this.mouseMoved(point);
		this.isLinking = this.from !== null;
		this.mouseMoved(point);
	}

	mouseMoved(point: Vector) {
		const button = this.doc.world.closestPlaceableOfType<Button>(
			point,
			"button"
		);
		const door = this.doc.world.closestPlaceableOfType<Door>(point, "door");
		console.log(button, door);
		if (this.isLinking) {
			if (this.from instanceof Button) {
				this.to = door;
			} else if (this.from instanceof Door) {
				this.to = button;
			} else {
				this.to = null;
			}
			this.isValidLink = this.from !== null && this.to !== null;
		} else {
			const pointToButton =
				button !== null
					? button.getCenter()!.sub(point).lengthSquared()
					: Number.POSITIVE_INFINITY;
			const pointToDoor =
				door !== null
					? door.getCenter().sub(point).lengthSquared()
					: Number.POSITIVE_INFINITY;
			this.from = pointToButton < pointToDoor ? button : door;
			this.to = null;
			this.isValidLink = false;
		}
	}

	mouseUp(point: Vector) {
		this.mouseMoved(point);
		if (this.isValidLink) {
			const button =
				this.from instanceof Button ? this.from : (this.to as Button);
			const door = this.from instanceof Door ? this.from : (this.to as Door);

			// Check if this link already exists
			let linkAlreadyExists = false;
			const placeables = this.doc.world.placeables;
			for (let i = 0; i < placeables.length; i++) {
				const placeable = placeables[i];
				if (
					placeable instanceof Link &&
					placeable.button === button &&
					placeable.door === door
				) {
					linkAlreadyExists = true;
					break;
				}
			}

			// Only add the new link if it doesn't already exist
			if (!linkAlreadyExists) {
				this.doc.addPlaceable(new Link(door, button));
			}
		}
		this.isLinking = false;
		this.mouseMoved(point);
	}

	draw(c: CanvasRenderingContext2D) {
		c.fillStyle = rgba(0, 0, 0, 0);
		c.strokeStyle = rgba(0, 0, 0, 0.5);
		if (this.from !== null) {
			this.from.drawSelection(c);
		}
		if (this.to !== null) {
			this.to.drawSelection(c);
		}
		if (this.isValidLink) {
			const button = this.from instanceof Button ? this.from : this.to;
			const door = this.from instanceof Door ? this.from : this.to;
			dashedLine(c, button!.getCenter()!, door!.getCenter()!);
		}
	}
}
