import { lerp } from "./math.js";
import { Vector } from "./vector.js";

export class Keyframe {
	center: Vector;
	angles: number[];

	constructor(x: number, y: number) {
		this.center = new Vector(x, y);
		this.angles = [];
	}

	add(...angles: number[]) {
		for (let i = 0; i < angles.length; i++) {
			this.angles.push((angles[i] * Math.PI) / 180);
		}
		return this;
	}

	lerpWith(keyframe: Keyframe, percent: number) {
		const result = new Keyframe(
			lerp(this.center.x, keyframe.center.x, percent),
			lerp(this.center.y, keyframe.center.y, percent)
		);
		for (let i = 0; i < this.angles.length; i++) {
			result.angles.push(lerp(this.angles[i], keyframe.angles[i], percent));
		}
		return result;
	}

	static lerp(keyframes: Keyframe[], percent: number) {
		let lower = Math.floor(percent);
		percent -= lower;
		lower = lower % keyframes.length;
		const upper = (lower + 1) % keyframes.length;
		return keyframes[lower].lerpWith(keyframes[upper], percent);
	}
}
