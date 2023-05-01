import { Segment } from "@/game/segment";
import { Vector } from "@/game/vector";

export const intersectSegments = (
	segment0: Segment,
	segment1: Segment,
	ref_segmentProportion0: { ref: number },
	ref_segmentProportion1: { ref: number },
	ref_contactPoint: { ref: Vector }
) => {
	const segStart0 = segment0.start;
	const segEnd0 = segment0.end;
	const segSize0 = segEnd0.sub(segStart0);
	const segStart1 = segment1.start;
	const segEnd1 = segment1.end;
	const segSize1 = segEnd1.sub(segStart1);

	// make sure these aren't parallel
	if (Math.abs(segSize0.dot(segSize1.flip())) < 0.000001) {
		return false;
	}

	// calculate the point of intersection...
	ref_segmentProportion0.ref =
		((segStart1.y - segStart0.y) * segSize1.x +
			(segStart0.x - segStart1.x) * segSize1.y) /
		(segSize0.y * segSize1.x - segSize1.y * segSize0.x);
	ref_segmentProportion1.ref =
		((segStart0.y - segStart1.y) * segSize0.x +
			(segStart1.x - segStart0.x) * segSize0.y) /
		(segSize1.y * segSize0.x - segSize0.y * segSize1.x);

	// where do these actually meet?
	ref_contactPoint.ref = segStart0.add(
		segSize0.mul(ref_segmentProportion0.ref)
	);

	// make sure the point of intersection is inside segment0
	if (ref_segmentProportion0.ref < 0 || ref_segmentProportion0.ref > 1) {
		return false;
	}

	// make sure the point of intersection is inside segment1
	if (ref_segmentProportion1.ref < 0 || ref_segmentProportion1.ref > 1) {
		return false;
	}

	// now that we've checked all this, the segments do intersect.
	return true;
};
