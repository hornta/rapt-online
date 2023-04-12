import { TEXT_BOX_X_MARGIN, TEXT_BOX_Y_MARGIN } from "../../constants";
import { splitUpText } from "../../utils";
import { Vector } from "../../vector";
import { Polygon, Rectangle, Circle } from "../shapes";
import {
	drawBomber,
	drawBouncyRocketLauncher,
	drawCloud,
	drawCog,
	drawDoomMagnet,
	drawGrenadier,
	drawHeadache,
	drawHunter,
	drawMultiGun,
	drawPopper,
	drawRiotGun,
	drawShockHawk,
	drawSign,
	drawSpider,
	drawSpikeBall,
	drawStalacbat,
	drawWallAvoider,
	drawWallCrawler,
	drawWheeligator,
} from "../sprites";
import { BasePlaceable } from "./placeable";

export const SPRITE_BOMBER = 0;
export const SPRITE_DOOM_MAGNET = 1;
export const SPRITE_HUNTER = 2;
export const SPRITE_MULTI_GUN = 3;
export const SPRITE_POPPER = 4;
export const SPRITE_JET_STREAM = 5;
export const SPRITE_ROCKET_SPIDER = 6;
export const SPRITE_SPIKE_BALL = 7;
export const SPRITE_WALL_CRAWLER = 8;
export const SPRITE_WHEELIGATOR = 9;
export const SPRITE_BOUNCY_ROCKET_LAUNCHER = 10;
export const SPRITE_CORROSION_CLOUD = 11;
export const SPRITE_GRENADIER = 12;
export const SPRITE_HEADACHE = 13;
export const SPRITE_SHOCK_HAWK = 14;
export const SPRITE_STALACBAT = 15;
export const SPRITE_WALL_AVOIDER = 16;
export const SPRITE_COG = 17;
export const SPRITE_SIGN = 18;

type DrawFunc = (
	c: CanvasRenderingContext2D,
	alpha: number,
	color: number,
	angle: number,
	text: string
) => void;

export class Sprite extends BasePlaceable {
	id: number;
	radius: number;
	drawFunc: DrawFunc;
	color: number;
	text: string;
	textRect: Rectangle | null;

	constructor(
		id: number,
		radius: number,
		drawFunc: DrawFunc,
		anchor = new Vector(0, 0),
		color = 0,
		angle = 0
	) {
		super("sprite", anchor, angle);

		this.id = id;
		this.radius = radius;
		this.drawFunc = drawFunc;
		this.color = color;
		this.angle = angle;
		this.text = "";
		this.textRect = null;
	}

	getAnglePolygon() {
		const direction = Vector.fromAngle(this.angle);
		return new Polygon(
			this.anchor!.add(direction.mul(this.radius + 0.4)),
			this.anchor!.add(
				direction.mul(this.radius + 0.2).add(direction.flip().mul(0.2))
			),
			this.anchor!.add(
				direction.mul(this.radius + 0.2).sub(direction.flip().mul(0.2))
			)
		);
	}

	hasAnglePolygon() {
		return (
			this.id === SPRITE_JET_STREAM ||
			this.id === SPRITE_WALL_CRAWLER ||
			this.id === SPRITE_WHEELIGATOR ||
			this.id === SPRITE_BOMBER
		);
	}

	draw(c: CanvasRenderingContext2D, alpha?: number) {
		c.save();
		this.calcTextRect(c);
		c.translate(this.anchor!.x, this.anchor!.y);
		this.drawFunc(c, alpha ?? 1, this.color, this.angle, this.text);
		c.restore();
	}

	calcTextRect(c: CanvasRenderingContext2D) {
		const textArray = splitUpText(c, this.text);
		const textSize = 13;
		const center = new Vector(
			0,
			0.5 * 50 + ((textSize + 2) * textArray.length) / 2
		);
		const numLines = textArray.length;
		c.font = textSize + "px Arial, sans-serif";
		const lineHeight = textSize + 2;
		const textHeight = lineHeight * numLines;
		let textWidth = -1;
		for (let i = 0; i < numLines; ++i) {
			const currWidth = c.measureText(textArray[i]).width;
			if (textWidth < currWidth) {
				textWidth = currWidth;
			}
		}
		this.textRect = new Rectangle(center, center).expand(
			textWidth / 2 + TEXT_BOX_X_MARGIN,
			textHeight / 2 + TEXT_BOX_Y_MARGIN
		);
		this.textRect.min = this.textRect.min.div(50).add(this.anchor!);
		this.textRect.max = this.textRect.max.div(50).add(this.anchor!);
	}

	drawSelection(c: CanvasRenderingContext2D) {
		c.beginPath();
		c.arc(
			this.anchor!.x,
			this.anchor!.y,
			this.radius + 0.1,
			0,
			Math.PI * 2,
			false
		);
		c.fill();
		c.stroke();

		if (this.hasAnglePolygon()) {
			this.getAnglePolygon().draw(c);
		}

		if (this.id === SPRITE_SIGN) {
			this.calcTextRect(c);
			const rect = this.textRect!.expand(0.1, 0.1);
			const x = rect.min.x;
			const y = rect.min.y;
			const w = rect.max.x - rect.min.x;
			const h = rect.max.y - rect.min.y;
			c.fillRect(x, y, w, h);
			c.strokeRect(x, y, w, h);
		}
	}

	touchesRect(rect: Rectangle) {
		return (
			new Circle(this.anchor!, this.radius).intersectsRect(rect) ||
			(this.textRect !== null && this.textRect.intersectsRect(rect))
		);
	}

	clone(newAnchor: Vector, newColor?: number, newAngle?: number) {
		return new Sprite(
			this.id,
			this.radius,
			this.drawFunc,
			newAnchor,
			newColor,
			newAngle
		);
	}

	getAngle() {
		return this.angle;
	}

	setAngle(newAngle: number) {
		this.angle = newAngle;
	}
}

export const spriteTemplates = [
	// color-neutral enemies
	{
		name: "Bomber",
		sprite: new Sprite(SPRITE_BOMBER, 0.3, (c, alpha) => {
			drawBomber(c, alpha, 0.7);
		}),
	},
	{
		name: "Doom Magnet",
		sprite: new Sprite(SPRITE_DOOM_MAGNET, 0.35, (c, alpha) => {
			drawDoomMagnet(c, alpha);
		}),
	},
	{
		name: "Hunter",
		sprite: new Sprite(SPRITE_HUNTER, 0.3, (c, alpha) => {
			drawHunter(c, alpha);
		}),
	},
	{
		name: "Multi-Gun",
		sprite: new Sprite(SPRITE_MULTI_GUN, 0.45, (c, alpha) => {
			drawMultiGun(c, alpha);
		}),
	},
	{
		name: "Popper",
		sprite: new Sprite(SPRITE_POPPER, 0.5, (c, alpha) => {
			drawPopper(c, alpha);
		}),
	},
	{
		name: "Jet Stream",
		sprite: new Sprite(SPRITE_JET_STREAM, 0.45, (c, alpha, color, angle) => {
			c.rotate(angle - Math.PI / 2);
			drawRiotGun(c, alpha, 0.75, Math.PI / 2);
		}),
	},
	{
		name: "Rocket Spider",
		sprite: new Sprite(SPRITE_ROCKET_SPIDER, 0.5, (c, alpha) => {
			drawSpider(c, alpha);
		}),
	},
	{
		name: "Spike Ball",
		sprite: new Sprite(SPRITE_SPIKE_BALL, 0.3, (c, alpha) => {
			drawSpikeBall(c, alpha);
		}),
	},
	{
		name: "Wall Crawler",
		sprite: new Sprite(SPRITE_WALL_CRAWLER, 0.25, (c, alpha) => {
			drawWallCrawler(c, alpha);
		}),
	},
	{
		name: "Wheeligator",
		sprite: new Sprite(SPRITE_WHEELIGATOR, 0.3, (c, alpha) => {
			drawWheeligator(c, alpha);
		}),
	},

	// color-specific enemies
	{
		name: "Bouncy Rockets",
		sprite: new Sprite(
			SPRITE_BOUNCY_ROCKET_LAUNCHER,
			0.3,
			(c, alpha, color) => {
				drawBouncyRocketLauncher(c, alpha, color === 1);
			}
		),
	},
	{
		name: "Corrosion Cloud",
		sprite: new Sprite(SPRITE_CORROSION_CLOUD, 0.5, (c, alpha, color) => {
			drawCloud(c, alpha, color === 1);
		}),
	},
	{
		name: "Grenadier",
		sprite: new Sprite(SPRITE_GRENADIER, 0.35, (c, alpha, color) => {
			drawGrenadier(c, alpha, color === 1);
		}),
	},
	{
		name: "Headache",
		sprite: new Sprite(SPRITE_HEADACHE, 0.5, (c, alpha, color) => {
			drawHeadache(c, alpha, color === 1);
		}),
	},
	{
		name: "Shock Hawk",
		sprite: new Sprite(SPRITE_SHOCK_HAWK, 0.3, (c, alpha, color) => {
			drawShockHawk(c, alpha, color === 1);
		}),
	},
	{
		name: "Stalacbat",
		sprite: new Sprite(SPRITE_STALACBAT, 0.2, (c, alpha, color) => {
			drawStalacbat(c, alpha, color === 1);
		}),
	},
	{
		name: "Wall Avoider",
		sprite: new Sprite(SPRITE_WALL_AVOIDER, 0.3, (c, alpha, color) => {
			drawWallAvoider(c, alpha, color === 1);
		}),
	},

	// game objects
	{
		name: "Cog",
		sprite: new Sprite(SPRITE_COG, 0.25, (c, alpha) => {
			drawCog(c, alpha, 0.25);
		}),
	},
	{
		name: "Sign",
		sprite: new Sprite(SPRITE_SIGN, 0.25, (c, alpha, color, angle, text) => {
			drawSign(c, alpha, text);
		}),
	},
];
