import { BackgroundCache } from "./backgroundCache.js";
import { gameState } from "./game.js";
import { Particle } from "./particle.js";
import { Vector } from "./vector.js";

export const render = (
	c: CanvasRenderingContext2D,
	center: Vector,
	width: number,
	height: number,
	backgroundCache: BackgroundCache
) => {
	const halfWidth = width / 2;
	const halfHeight = height / 2;
	const xmin = center.x - halfWidth;
	const ymin = center.y - halfHeight;
	const xmax = center.x + halfWidth;
	const ymax = center.y + halfHeight;
	c.save();
	c.translate(-center.x, -center.y);

	backgroundCache.draw(c, xmin, ymin, xmax, ymax);

	gameState.draw(c, xmin, ymin, xmax, ymax);
	Particle.draw(c);
	c.restore();
};
