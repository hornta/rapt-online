import { Circle } from "@/game/circle";
import { Segment } from "@/game/segment";
import { intersectCircleLine } from "./intersectCircleLine";

export const intersectCircleSegment = (circle: Circle, segment: Segment) => {
	const ref_lineProportion0: { ref: number } = { ref: 0 };
	const ref_lineProportion1: { ref: number } = { ref: 0 };
	if (
		!intersectCircleLine(
			circle,
			segment,
			ref_lineProportion0,
			ref_lineProportion1
		)
	) {
		return false;
	}

	if (ref_lineProportion0.ref >= 0 && ref_lineProportion0.ref <= 1) {
		return true;
	}

	return ref_lineProportion1.ref >= 0 && ref_lineProportion1.ref <= 1;
};
