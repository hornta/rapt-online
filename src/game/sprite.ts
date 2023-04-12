import { Vector } from "./vector";

export class Sprite {
	flip: boolean;
	angle = 0;
	offsetBeforeRotation = new Vector(0, 0);
	offsetAfterRotation = new Vector(0, 0);
	parent: Sprite | null = null;
	firstChild: Sprite | null = null;
	nextSibling: Sprite | null = null;
	drawGeometry: (c: CanvasRenderingContext2D) => void;

	constructor(drawGeometry: (c: CanvasRenderingContext2D) => void) {
		this.flip = false;
		this.drawGeometry = drawGeometry;
	}

	clone() {
		const sprite = new Sprite(this.drawGeometry);
		sprite.flip = this.flip;
		sprite.angle = this.angle;
		sprite.offsetBeforeRotation = this.offsetBeforeRotation;
		sprite.offsetAfterRotation = this.offsetAfterRotation;
		return sprite;
	}

	setParent(newParent: Sprite) {
		// remove from the old parent
		if (this.parent !== null) {
			if (this.parent.firstChild === this) {
				this.parent.firstChild = this.nextSibling;
			} else {
				for (
					let sprite = this.parent.firstChild;
					sprite !== null;
					sprite = sprite.nextSibling
				) {
					if (sprite.nextSibling === this) {
						sprite.nextSibling = this.nextSibling;
					}
				}
			}
		}

		// switch to new parent
		this.nextSibling = null;
		this.parent = newParent;

		// add to new parent
		if (this.parent !== null) {
			this.nextSibling = this.parent.firstChild;
			this.parent.firstChild = this;
		}
	}

	draw(c: CanvasRenderingContext2D) {
		c.save();
		c.translate(this.offsetBeforeRotation.x, this.offsetBeforeRotation.y);
		if (this.flip) {
			c.scale(-1, 1);
		}
		c.rotate(this.angle);
		c.translate(this.offsetAfterRotation.x, this.offsetAfterRotation.y);

		this.drawGeometry(c);
		for (
			let sprite = this.firstChild;
			sprite !== null;
			sprite = sprite.nextSibling
		) {
			sprite.draw(c);
		}

		c.restore();
	}
}
