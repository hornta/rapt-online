import { Circle } from "@/game/circle";
import { Contact } from "@/game/contact";
import { Segment } from "@/game/segment";
import { Vector } from "@/game/vector";
import { intersectCircleLine } from "../intersect/intersectCircleLine";

export const collideCirclePoint = (
	circle: Circle,
	deltaPosition: Vector,
	point: Vector
): Contact | null => {
	// deltaProportion1 is a throwaway
	// we can only use segmentProportion0 because segmentProportion1 represents the intersection
	// when the circle travels so that the point moves OUT of it, so we don't want to stop it from doing that.
	const ref_deltaProportion0: { ref: number } = {} as { ref: number };
	const ref_deltaProportion1: { ref: number } = {} as { ref: number };

	// BUGFIX: shock hawks were disappearing on Traps when deltaPosition was very small, which caused
	// us to try to solve a quadratic with a second order coefficient of zero and put NaNs everywhere
	const delta = deltaPosition.length();
	if (delta < 0.0000001) {
		return null;
	}

	// if these don't intersect at all, then forget about it.
	if (
		!intersectCircleLine(
			circle,
			new Segment(point, point.sub(deltaPosition)),
			ref_deltaProportion0,
			ref_deltaProportion1
		)
	) {
		return null;
	}

	// check that this actually happens inside of the segment.
	if (ref_deltaProportion0.ref < 0 || ref_deltaProportion0.ref > 1) {
		return null;
	}

	// find where the circle will be at the time of the collision
	const circleCenterWhenCollides = circle.center.add(
		deltaPosition.mul(ref_deltaProportion0.ref)
	);

	return {
		contactPoint: point,
		normal: circleCenterWhenCollides.sub(point).unit(),
		proportionOfDelta: ref_deltaProportion0.ref,
	};
};
