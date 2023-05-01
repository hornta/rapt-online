import { Circle } from "@/game/circle";
import { Segment } from "@/game/segment";

export const penetrationCircleSegment = (circle: Circle, segment: Segment) => {
	// a directed radius towards the segment
	const radiusToLine = segment.normal.mul(-circle.radius);

	// position on the circle closest to the inside of the line
	const innermost = circle.center.add(radiusToLine);

	// map this onto the normal.
	return innermost.sub(segment.start).dot(segment.normal);
};
