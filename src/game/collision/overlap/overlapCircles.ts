import { Circle } from "@/game/circle";

export const overlapCircles = (circle0: Circle, circle1: Circle) => {
	return (
		circle1.getCenter().sub(circle0.getCenter()).lengthSquared() <=
		(circle0.radius + circle1.radius) * (circle0.radius + circle1.radius)
	);
};
