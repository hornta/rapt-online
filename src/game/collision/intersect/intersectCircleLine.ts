import { Circle } from "@/game/circle";
import { Segment } from "@/game/segment";

export const intersectCircleLine = (
	circle: Circle,
	line: Segment,
	ref_lineProportion0: { ref: number },
	ref_lineProportion1: { ref: number }
) => {
	// variables taken from http://local.wasp.uwa.edu.au/~pbourke/geometry/sphereline/
	// thanks, internet!

	const lineStart = line.start;
	const lineEnd = line.end;
	const lineSize = lineEnd.sub(lineStart);

	// find quadratic equation variables
	const a = lineSize.lengthSquared();
	const b = 2 * lineSize.dot(lineStart.sub(circle.center));
	const c =
		lineStart.sub(circle.center).lengthSquared() -
		circle.radius * circle.radius;

	const insideSqrt = b * b - 4 * a * c;
	if (insideSqrt < 0) {
		return false;
	}

	// calculate the point of intersection...
	ref_lineProportion0.ref = ((-b - Math.sqrt(insideSqrt)) * 0.5) / a;
	ref_lineProportion1.ref = ((-b + Math.sqrt(insideSqrt)) * 0.5) / a;

	return true;
};
