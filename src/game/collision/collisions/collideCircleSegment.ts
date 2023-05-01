import { Circle } from "@/game/circle";
import { Contact } from "@/game/contact";
import { Segment } from "@/game/segment";
import { Vector } from "@/game/vector";
import { intersectSegments } from "../intersect/intersectSegments";
import { collideCirclePoint } from "./collideCirclePoint";

export const collideCircleSegment = (
	circle: Circle,
	deltaPosition: Vector,
	segment: Segment
): Contact | null => {
	const segmentNormal = segment.normal;

	// a directed radius towards the segment
	const radiusToLine = segmentNormal.mul(-circle.radius);

	// position of this circle after being moved
	const newCircle = new Circle(circle.center.add(deltaPosition), circle.radius);

	// the point on the new circle farthest "in" this segment
	const newCircleInnermost = newCircle.center.add(radiusToLine);

	const endedInside =
		newCircleInnermost.sub(segment.start).dot(segmentNormal) < 0.001;

	// if the circle didn't end inside this segment, then it's not a collision.
	if (!endedInside) {
		return null;
	}

	// the point on the circle farthest "in" this segment, before moving
	const circleInnermost = newCircleInnermost.sub(deltaPosition);

	// did this circle start completely outside this segment?
	const startedOutside =
		circleInnermost.sub(segment.start).dot(segmentNormal) > 0;

	// if the circle started outside this segment, then it might have hit the flat part of this segment
	if (startedOutside) {
		const ref_segmentProportion: { ref: number } = {} as { ref: number };
		const ref_proportionOfDelta: { ref: number } = {} as { ref: number };
		const ref_contactPoint: { ref: Vector } = {} as { ref: Vector };
		if (
			intersectSegments(
				segment,
				new Segment(circleInnermost, newCircleInnermost),
				ref_segmentProportion,
				ref_proportionOfDelta,
				ref_contactPoint
			)
		) {
			// we can return this because the circle will always hit the flat part before it hits an end
			return {
				contactPoint: ref_contactPoint.ref,
				normal: segmentNormal,
				proportionOfDelta: ref_proportionOfDelta.ref,
			};
		}
	}

	// get the contacts that occurred when the edge of the circle hit an endpoint of this edge.
	const startContact = collideCirclePoint(circle, deltaPosition, segment.start);
	const endContact = collideCirclePoint(circle, deltaPosition, segment.end);

	// select the collision that occurred first
	if (!startContact && !endContact) {
		return null;
	}
	if (startContact && !endContact) {
		return startContact;
	}
	if (!startContact && endContact) {
		return endContact;
	}
	if (startContact!.proportionOfDelta < endContact!.proportionOfDelta) {
		return startContact;
	}
	return endContact;
};
