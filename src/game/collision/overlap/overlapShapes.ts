import { isAABB } from "@/game/aabb";
import { isCircle } from "@/game/circle";
import { isPolygon } from "@/game/polygon";
import { Shape } from "@/game/shape";
import { overlapCirclePolygon } from "./overlapCirclePolygon";
import { overlapCircles } from "./overlapCircles";
import { overlapPolygons } from "./overlapPolygons";

export const overlapShapes = (shape0: Shape, shape1: Shape) => {
	let shapeTempPointer = null;
	let shape0Pointer = shape0.copy();
	let shape1Pointer = shape1.copy();

	// convert aabb's to polygons
	if (isAABB(shape0Pointer)) {
		shapeTempPointer = shape0Pointer;
		shape0Pointer = shape0Pointer.getPolygon();
	}
	if (isAABB(shape1Pointer)) {
		shapeTempPointer = shape1Pointer;
		shape1Pointer = shape1Pointer.getPolygon();
	}

	// swap the shapes so that they're in order
	if (shape0Pointer.getType() > shape1Pointer.getType()) {
		shapeTempPointer = shape1Pointer;
		shape1Pointer = shape0Pointer;
		shape0Pointer = shapeTempPointer;
	}

	let result;

	// if they're both circles
	if (isCircle(shape0Pointer) && isCircle(shape1Pointer)) {
		result = overlapCircles(shape0Pointer, shape1Pointer);
	}

	// if one is a circle and one is a polygon
	else if (isCircle(shape0Pointer) && isPolygon(shape1Pointer)) {
		result = overlapCirclePolygon(shape0Pointer, shape1Pointer);
	}

	// if both are polygons
	else if (isPolygon(shape0Pointer) && isPolygon(shape1Pointer)) {
		result = overlapPolygons(shape0Pointer, shape1Pointer);
	}

	// we would only get here if we received an impossible pair of shapes.
	else {
		alert("assertion failed in CollisionDetector.overlapShapes");
	}

	return result;
};
