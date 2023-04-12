// caching strategy: cache the level background around each player on two
// canvases twice the size of the screen and re-center them as needed

import { GAME_SCALE } from "./constants";
import { gameState } from "./game";

export class BackgroundCache {
	canvas: HTMLCanvasElement;
	c: CanvasRenderingContext2D;
	xmin: number;
	ymin: number;
	xmax: number;
	ymax: number;
	width: number;
	height: number;
	ratio: number;
	modificationCount: number;

	constructor(name: string) {
		// create a <canvas>, unless we already created one in a previous game
		const id = "background-cache-" + name;
		this.canvas = document.createElement("canvas");
		this.canvas.id = id;
		this.canvas.style.display = "none";
		document.body.appendChild(this.canvas);
		const context = this.canvas.getContext("2d")!;
		this.c = context;

		// the cache is empty at first
		this.xmin = 0;
		this.ymin = 0;
		this.xmax = 0;
		this.ymax = 0;

		this.width = 0;
		this.height = 0;
		this.ratio = 1;

		this.modificationCount = -1;
	}

	destroy() {
		document.body.removeChild(this.canvas);
	}

	draw(
		c: CanvasRenderingContext2D,
		xmin: number,
		ymin: number,
		xmax: number,
		ymax: number
	) {
		const ratio = 1; // Retina support

		// if cache is invalid, update cache
		const isCacheStale =
			this.modificationCount !== gameState.modificationCount ||
			xmin < this.xmin ||
			xmax > this.xmax ||
			ymin < this.ymin ||
			ymax > this.ymax;
		if (isCacheStale) {
			this.modificationCount = gameState.modificationCount;

			// set bounds of cached image
			const viewportWidth = 2 * (xmax - xmin);
			const viewportHeight = 2 * (ymax - ymin);
			this.xmin = xmin - viewportWidth / 4;
			this.ymin = ymin - viewportHeight / 4;
			this.xmax = xmax + viewportWidth / 4;
			this.ymax = ymax + viewportHeight / 4;

			// resize canvas bigger if needed
			const width = Math.ceil(viewportWidth * GAME_SCALE);
			const height = Math.ceil(viewportHeight * GAME_SCALE);
			this.width = width;
			this.height = height;
			this.canvas.width = Math.round(this.width * ratio);
			this.canvas.height = Math.round(this.height * ratio);
			this.c.scale(ratio, ratio);

			// clear the background
			this.c.fillStyle = "#BFBFBF";
			this.c.fillRect(0, 0, width, height);

			// set up transform
			this.c.save();
			this.c.translate(width / 2, height / 2);
			this.c.scale(GAME_SCALE, -GAME_SCALE);
			this.c.lineWidth = 1 / GAME_SCALE;

			// render
			this.c.translate(
				-(this.xmin + this.xmax) / 2,
				-(this.ymin + this.ymax) / 2
			);
			gameState.world.draw(this.c, this.xmin, this.ymin, this.xmax, this.ymax);

			// undo transform
			this.c.restore();

			// draw an X so we can see the cache (for debugging)
			// this.c.strokeStyle = "rgba(0, 0, 0, 0.1)";
			// this.c.lineWidth = 5;
			// this.c.beginPath();
			// this.c.moveTo(0, 0);
			// this.c.lineTo(width, height);
			// this.c.moveTo(width, 0);
			// this.c.lineTo(0, height);
			// this.c.stroke();
		}

		// draw from cache
		// for performance, we MUST make sure the image is drawn at an integer coordinate to take
		// advantage of fast blitting, otherwise browsers will use slow software bilinear interpolation
		c.imageSmoothingEnabled = false;
		c.save();
		c.setTransform(ratio, 0, 0, ratio, 0, 0);
		c.drawImage(
			this.canvas,
			Math.round((this.xmin - xmin) * GAME_SCALE),
			Math.round((2 * ymin - ymax - this.ymin) * GAME_SCALE),
			this.width,
			this.height
		);
		c.restore();
	}
}
