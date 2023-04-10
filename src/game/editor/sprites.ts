import { randInRange } from "../math.js";
import { rgba, drawTextBox, splitUpText } from "../utils.js";
import { Vector } from "../vector.js";

export const drawSpawnPoint = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	point: Vector
) {
	// Outer bubble
	c.strokeStyle = c.fillStyle = rgba(255, 255, 255, alpha * 0.1);
	c.beginPath();
	c.arc(point.x, point.y, 1, 0, 2 * Math.PI, false);
	c.stroke();
	c.fill();

	// Glow from base
	const gradient = c.createLinearGradient(0, point.y - 0.4, 0, point.y + 0.6);
	gradient.addColorStop(0, rgba(255, 255, 255, alpha * 0.75));
	gradient.addColorStop(1, rgba(255, 255, 255, 0));
	c.fillStyle = gradient;
	c.beginPath();
	c.lineTo(point.x - 0.35, point.y + 0.6);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.35, point.y + 0.6);
	c.fill();

	// Black base
	c.fillStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.moveTo(point.x - 0.1, point.y - 0.45);
	c.lineTo(point.x - 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.4);
	c.lineTo(point.x + 0.1, point.y - 0.45);
	c.arc(point.x, point.y - 0.45, 0.2, 0, Math.PI, true);
	c.fill();
};

export const drawGoal = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	point: Vector,
	time: number
) {
	let percent = time - Math.floor(time);
	percent = 1 - percent;
	percent = (percent - Math.pow(percent, 6)) * 1.72;
	percent = 1 - percent;

	// Draw four arrows pointing inwards
	c.fillStyle = rgba(0, 0, 0, alpha);
	for (let i = 0; i < 4; ++i) {
		const angle = i * ((2 * Math.PI) / 4);
		const s = Math.sin(angle);
		const csn = Math.cos(angle);
		const radius = 0.45 - percent * 0.25;
		const size = 0.15;
		c.beginPath();
		c.moveTo(
			point.x + csn * radius - s * size,
			point.y + s * radius + csn * size
		);
		c.lineTo(
			point.x + csn * radius + s * size,
			point.y + s * radius - csn * size
		);
		c.lineTo(point.x + csn * (radius - size), point.y + s * (radius - size));
		c.fill();
	}
};

export const drawCog = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	radius: number
) {
	const spokeRadius = radius * 0.8;
	const spokeWidth1 = radius * 0.2;
	const spokeWidth2 = radius * 0.075;
	const numVertices = 64;
	const numTeeth = 10;
	const numSpokes = 5;
	let i;
	let angle;
	let sin;
	let cos;
	let r;

	c.fillStyle = rgba(255, 255, 0, alpha);

	// Draw the outer rim with teeth
	c.beginPath();
	for (i = 0; i <= numVertices; i++) {
		angle = ((i + 0.25) / numVertices) * (Math.PI * 2);
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		r = radius * (1 + Math.cos(angle * numTeeth) * 0.1);
		c.lineTo(cos * r, sin * r);
	}
	c.closePath();

	// Draw the inner rim
	c.arc(0, 0, radius * 0.65, 0, Math.PI * 2, true);
	c.closePath();

	// Draw the spokes
	for (i = 0; i < numSpokes; i++) {
		angle = (i / numSpokes) * (Math.PI * 2);
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		c.moveTo(sin * spokeWidth1, -cos * spokeWidth1);
		c.lineTo(
			cos * spokeRadius + sin * spokeWidth2,
			sin * spokeRadius - cos * spokeWidth2
		);
		c.lineTo(
			cos * spokeRadius - sin * spokeWidth2,
			sin * spokeRadius + cos * spokeWidth2
		);
		c.lineTo(-sin * spokeWidth1, cos * spokeWidth1);
		c.closePath();
	}
	c.fill();
};

export const drawBomber = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	reloadPercentage: number
) {
	const bomberHeight = 0.4;
	const bombRadius = 0.15;

	c.save();
	c.translate(0, 0.05);

	// Bomber body
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.moveTo(-0.25, -0.2);
	c.lineTo(-0.25, -0.1);
	c.lineTo(-0.1, 0.05);
	c.lineTo(0.1, 0.05);
	c.lineTo(0.25, -0.1);
	c.lineTo(0.25, -0.2);
	c.arc(0, -bomberHeight * 0.5, bombRadius, 0, Math.PI, false);
	c.lineTo(-0.25, -0.2);
	c.moveTo(-0.1, 0.05);
	c.lineTo(-0.2, 0.15);
	c.moveTo(0.1, 0.05);
	c.lineTo(0.2, 0.15);
	c.stroke();

	// Growing bomb about to be dropped
	c.fillStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(
		0,
		-bomberHeight * 0.5,
		bombRadius * reloadPercentage,
		0,
		2 * Math.PI,
		false
	);
	c.fill();

	c.restore();
};

export const drawBouncyRocketLauncher = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	redIsFirst: boolean
) {
	// End of gun
	const v = Math.sqrt(0.2 * 0.2 - 0.1 * 0.1);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.moveTo(-v, -0.1);
	c.lineTo(-0.3, -0.1);
	c.lineTo(-0.3, 0.1);
	c.lineTo(-v, 0.1);
	c.stroke();

	// Main body
	c.fillStyle = rgba(
		255 * Number(redIsFirst),
		0,
		255 * Number(!redIsFirst),
		alpha
	);
	c.beginPath();
	c.arc(0, 0, 0.2, 1.65 * Math.PI, 2.35 * Math.PI, true);
	c.fill();
	c.fillStyle = rgba(
		255 * Number(!redIsFirst),
		0,
		255 * Number(redIsFirst),
		alpha
	);
	c.beginPath();
	c.arc(0, 0, 0.2, 1.65 * Math.PI, 2.35 * Math.PI, false);
	c.fill();

	// Line circling the two colors
	c.beginPath();
	c.arc(0, 0, 0.2, 0, 2 * Math.PI, false);
	c.stroke();

	// Line separating the two colors
	c.beginPath();
	c.moveTo(Math.cos(1.65 * Math.PI) * 0.2, Math.sin(1.65 * Math.PI) * 0.2);
	c.lineTo(Math.cos(2.35 * Math.PI) * 0.2, Math.sin(2.35 * Math.PI) * 0.2);
	c.stroke();
};

export const drawDoomMagnet = function (
	c: CanvasRenderingContext2D,
	alpha: number
) {
	const length = 0.15;
	const outerRadius = 0.15;
	const innerRadius = 0.05;

	for (let scale = -1; scale <= 1; scale += 2) {
		// Draw red tips
		c.fillStyle = rgba(0, 0, 255, alpha);
		c.beginPath();
		c.moveTo(-outerRadius - length, scale * innerRadius);
		c.lineTo(-outerRadius - length, scale * outerRadius);
		c.lineTo(
			-outerRadius - length + (outerRadius - innerRadius),
			scale * outerRadius
		);
		c.lineTo(
			-outerRadius - length + (outerRadius - innerRadius),
			scale * innerRadius
		);
		c.fill();

		// Draw blue tips
		c.fillStyle = rgba(255, 0, 0, alpha);
		c.beginPath();
		c.moveTo(outerRadius + length, scale * innerRadius);
		c.lineTo(outerRadius + length, scale * outerRadius);
		c.lineTo(
			outerRadius + length - (outerRadius - innerRadius),
			scale * outerRadius
		);
		c.lineTo(
			outerRadius + length - (outerRadius - innerRadius),
			scale * innerRadius
		);
		c.fill();
	}
	c.strokeStyle = rgba(0, 0, 0, alpha);

	// Draw one prong of the magnet
	c.beginPath();
	c.arc(outerRadius, 0, outerRadius, 1.5 * Math.PI, 0.5 * Math.PI, true);
	c.lineTo(outerRadius + length, outerRadius);
	c.lineTo(outerRadius + length, innerRadius);

	c.arc(outerRadius, 0, innerRadius, 0.5 * Math.PI, 1.5 * Math.PI, false);
	c.lineTo(outerRadius + length, -innerRadius);
	c.lineTo(outerRadius + length, -outerRadius);
	c.lineTo(outerRadius, -outerRadius);
	c.stroke();

	// Draw other prong
	c.beginPath();
	c.arc(-outerRadius, 0, outerRadius, 1.5 * Math.PI, 2.5 * Math.PI, false);
	c.lineTo(-outerRadius - length, outerRadius);
	c.lineTo(-outerRadius - length, innerRadius);

	c.arc(-outerRadius, 0, innerRadius, 2.5 * Math.PI, 1.5 * Math.PI, true);
	c.lineTo(-outerRadius - length, -innerRadius);
	c.lineTo(-outerRadius - length, -outerRadius);
	c.lineTo(-outerRadius, -outerRadius);
	c.stroke();
};

export const drawGrenadier = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	isRed: boolean
) {
	const barrelLength = 0.25;
	const outerRadius = 0.25;
	const innerRadius = 0.175;

	// Draw a 'V' shape
	c.fillStyle = rgba(255 * Number(isRed), 0, 255 * Number(!isRed), alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.moveTo(-outerRadius, -barrelLength);
	c.lineTo(-innerRadius, -barrelLength);
	c.lineTo(-innerRadius, -0.02);
	c.lineTo(0, innerRadius);
	c.lineTo(innerRadius, -0.02);
	c.lineTo(innerRadius, -barrelLength);
	c.lineTo(outerRadius, -barrelLength);
	c.lineTo(outerRadius, 0);
	c.lineTo(0, outerRadius + 0.02);
	c.lineTo(-outerRadius, 0);
	c.closePath();
	c.fill();
	c.stroke();
};

export const drawHunter = function (
	c: CanvasRenderingContext2D,
	alpha: number
) {
	function drawClaw(c: CanvasRenderingContext2D) {
		c.beginPath();
		c.moveTo(0, 0.1);
		for (let i = 0; i <= 6; i++) {
			c.lineTo((i & 1) / 24, 0.2 + i * 0.05);
		}
		c.arc(0, 0.2, 0.3, 0.5 * Math.PI, -0.5 * Math.PI, true);
		c.stroke();
	}

	// Draw the eye
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, -0.2, 0.1, 0, 2 * Math.PI, false);
	c.stroke();

	// Draw the claws
	const clawAngle = 0.1;
	c.save();
	c.translate(0, -0.2);
	c.rotate(-clawAngle);
	drawClaw(c);
	c.rotate(2 * clawAngle);
	c.scale(-1, 1);
	drawClaw(c);
	c.restore();
};

function drawLeg(
	c: CanvasRenderingContext2D,
	x: number,
	y: number,
	angle1: number,
	angle2: number,
	legLength: number
) {
	angle1 *= Math.PI / 180;
	angle2 = angle1 + (angle2 * Math.PI) / 180;
	const kneeX = x + Math.sin(angle1) * legLength;
	const kneeY = y - Math.cos(angle1) * legLength;

	// Draw leg with one joint
	c.beginPath();
	c.moveTo(x, y);
	c.lineTo(kneeX, kneeY);
	c.lineTo(
		kneeX + Math.sin(angle2) * legLength,
		kneeY - Math.cos(angle2) * legLength
	);
	c.stroke();
}

export const drawPopper = function (
	c: CanvasRenderingContext2D,
	alpha: number
) {
	function drawBody(c: CanvasRenderingContext2D, x: number, y: number) {
		c.save();
		c.translate(x, y);

		// Draw shell
		c.beginPath();
		c.moveTo(0.2, -0.2);
		c.lineTo(-0.2, -0.2);
		c.lineTo(-0.3, 0);
		c.lineTo(-0.2, 0.2);
		c.lineTo(0.2, 0.2);
		c.lineTo(0.3, 0);
		c.lineTo(0.2, -0.2);
		c.moveTo(0.15, -0.15);
		c.lineTo(-0.15, -0.15);
		c.lineTo(-0.23, 0);
		c.lineTo(-0.15, 0.15);
		c.lineTo(0.15, 0.15);
		c.lineTo(0.23, 0);
		c.lineTo(0.15, -0.15);
		c.stroke();

		// Draw eyes
		c.beginPath();
		c.arc(-0.075, 0, 0.04, 0, 2 * Math.PI, false);
		c.arc(0.075, 0, 0.04, 0, 2 * Math.PI, false);
		c.fill();

		c.restore();
	}

	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	drawBody(c, 0, 0.1);
	drawLeg(c, -0.2, -0.1, -80, 100, 0.3);
	drawLeg(c, -0.1, -0.1, -80, 100, 0.3);
	drawLeg(c, 0.1, -0.1, 80, -100, 0.3);
	drawLeg(c, 0.2, -0.1, 80, -100, 0.3);
};

const cloudCircles: {
	centerX: number;
	centerY: number;
	radius: number;
	alpha: number;
}[] = [];
for (let i = 0; i < 50; i++) {
	const angle = randInRange(0, Math.PI * 2);
	const radius = Math.sqrt(Math.random()) * 0.4;
	cloudCircles.push({
		centerX: Math.cos(angle) * radius,
		centerY: Math.sin(angle) * radius,
		radius: randInRange(0.05, 0.15),
		alpha: randInRange(0.1, 0.5),
	});
}

export const drawCloud = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	isRed: boolean
) {
	// Draw particles
	for (let i = 0; i < 50; i++) {
		c.fillStyle = rgba(
			127 * Number(isRed),
			0,
			127 * Number(!isRed),
			alpha * cloudCircles[i].alpha
		);
		c.beginPath();
		c.arc(
			cloudCircles[i].centerX,
			cloudCircles[i].centerY,
			cloudCircles[i].radius,
			0,
			Math.PI * 2,
			false
		);
		c.fill();
	}
};

export const drawShockHawk = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	isRed: boolean
) {
	// Draw solid center
	c.fillStyle = rgba(255 * Number(isRed), 0, 255 * Number(!isRed), alpha);
	c.beginPath();
	c.moveTo(0, -0.15);
	c.lineTo(0.05, -0.1);
	c.lineTo(0, 0.1);
	c.lineTo(-0.05, -0.1);
	c.fill();

	// Draw outlines
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	for (let scale = -1; scale <= 1; scale += 2) {
		c.moveTo(0, -0.3);
		c.lineTo(scale * 0.05, -0.2);
		c.lineTo(scale * 0.1, -0.225);
		c.lineTo(scale * 0.1, -0.275);
		c.lineTo(scale * 0.15, -0.175);
		c.lineTo(0, 0.3);

		c.moveTo(0, -0.15);
		c.lineTo(scale * 0.05, -0.1);
		c.lineTo(0, 0.1);
	}
	c.stroke();
};

export const drawStalacbat = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	isRed: boolean
) {
	function drawWing(c: CanvasRenderingContext2D) {
		const r = Math.sin(Math.PI / 4);
		c.beginPath();
		c.arc(0, 0, 0.2, 0, Math.PI / 2, false);
		c.arc(0, 0, 0.15, Math.PI / 2, 0, true);
		c.closePath();
		c.moveTo(r * 0.15, r * 0.15);
		c.lineTo(r * 0.1, r * 0.1);
		c.stroke();
	}

	// Draw body
	c.fillStyle = rgba(255 * Number(isRed), 0, 255 * Number(!isRed), alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, 0.1, 0, Math.PI * 2, false);
	c.fill();
	c.stroke();

	// Draw wings
	const wingAngle = Math.PI / 2;
	c.save();
	c.rotate(-wingAngle);
	drawWing(c);
	c.rotate(2 * wingAngle);
	c.scale(-1, 1);
	drawWing(c);
	c.restore();
};

export const drawWallAvoider = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	isRed: boolean
) {
	// Draw body
	c.fillStyle = rgba(255 * Number(isRed), 0, 255 * Number(!isRed), alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, 0.1, 0, 2 * Math.PI, false);
	c.fill();
	c.stroke();

	// Draw antennae
	c.beginPath();
	for (let i = 0; i < 4; i++) {
		const angle = i * ((2 * Math.PI) / 4);
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		c.moveTo(cos * 0.1, sin * 0.1);
		c.lineTo(cos * 0.3, sin * 0.3);
		c.moveTo(cos * 0.16 - sin * 0.1, sin * 0.16 + cos * 0.1);
		c.lineTo(cos * 0.16 + sin * 0.1, sin * 0.16 - cos * 0.1);
		c.moveTo(cos * 0.23 - sin * 0.05, sin * 0.23 + cos * 0.05);
		c.lineTo(cos * 0.23 + sin * 0.05, sin * 0.23 - cos * 0.05);
	}
	c.stroke();
};

export const drawWallCrawler = function (
	c: CanvasRenderingContext2D,
	alpha: number
) {
	// Draw arms
	const space = 0.15;
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, 0.25, Math.PI * 0.25 + space, Math.PI * 0.75 - space, false);
	c.stroke();
	c.beginPath();
	c.arc(0, 0, 0.25, Math.PI * 0.75 + space, Math.PI * 1.25 - space, false);
	c.stroke();
	c.beginPath();
	c.arc(0, 0, 0.25, Math.PI * 1.25 + space, Math.PI * 1.75 - space, false);
	c.stroke();
	c.beginPath();
	c.arc(0, 0, 0.25, Math.PI * 1.75 + space, Math.PI * 2.25 - space, false);
	c.stroke();
	c.beginPath();
	c.arc(0, 0, 0.15, 0, 2 * Math.PI, false);
	c.stroke();
	c.beginPath();
	c.moveTo(0.15, 0);
	c.lineTo(0.25, 0);
	c.moveTo(0, 0.15);
	c.lineTo(0, 0.25);
	c.moveTo(-0.15, 0);
	c.lineTo(-0.25, 0);
	c.moveTo(0, -0.15);
	c.lineTo(0, -0.25);
	c.stroke();

	// Draw bodt
	c.beginPath();
	c.arc(0, 0, 0.05, 0, 2 * Math.PI, false);
	c.fill();
};

export const drawWheeligator = function (
	c: CanvasRenderingContext2D,
	alpha: number
) {
	// Draw wheel
	const radius = 0.3;
	const rim = 0.1;
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, radius, 0, 2 * Math.PI, false);
	c.arc(0, 0, radius - rim, Math.PI, 3 * Math.PI, false);
	c.stroke();

	// Fill in notches on wheel
	for (let i = 0; i < 4; i++) {
		const startAngle = i * ((2 * Math.PI) / 4);
		const endAngle = startAngle + Math.PI / 4;
		c.beginPath();
		c.arc(0, 0, radius, startAngle, endAngle, false);
		c.arc(0, 0, radius - rim, endAngle, startAngle, true);
		c.fill();
	}
};

function makeDrawSpikes(count: number) {
	const spikeBallRadius = 0.2;
	const radii: number[] = [];
	for (let i = 0; i < count; i++) {
		radii.push(spikeBallRadius * randInRange(0.5, 1.5));
	}
	return function (c: CanvasRenderingContext2D) {
		c.beginPath();
		for (let i = 0; i < count; i++) {
			const angle = i * ((2 * Math.PI) / count);
			const radius = radii[i];
			c.moveTo(0, 0);
			c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
		}
		c.stroke();
	};
}

const spikeDrawFuncs = [
	makeDrawSpikes(11),
	makeDrawSpikes(13),
	makeDrawSpikes(7),
];

export const drawSpikeBall = function (
	c: CanvasRenderingContext2D,
	alpha: number
) {
	c.strokeStyle = rgba(0, 0, 0, alpha);
	spikeDrawFuncs[0](c);
	spikeDrawFuncs[1](c);
	spikeDrawFuncs[2](c);
};

export const drawRiotGun = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	reloadAnimation: number,
	directionAngle: number
) {
	function drawWheel() {
		const numBarrels = 3;
		c.beginPath();
		for (let i = 0; i < numBarrels; i++) {
			const angle = i * ((2 * Math.PI) / numBarrels);
			c.moveTo(0, 0);
			c.lineTo(0.2 * Math.cos(angle), 0.2 * Math.sin(angle));
		}
		c.stroke();
	}

	const numBarrels = 3;
	const angle = reloadAnimation * ((2 * Math.PI) / numBarrels);
	const targetAngle = directionAngle - Math.PI / 2;
	const bodyOffset = Vector.fromAngle(targetAngle).mul(0.2);

	c.fillStyle = rgba(255, 255, 0, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);

	c.save();
	c.translate(-0.2, 0);
	c.rotate(targetAngle + angle);
	drawWheel();
	c.restore();

	c.save();
	c.translate(0.2, 0);
	c.rotate(targetAngle - angle);
	drawWheel();
	c.restore();

	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < numBarrels; i++) {
			const theta = i * ((2 * Math.PI) / numBarrels) - side * angle;
			let reload =
				(reloadAnimation - i * side) / numBarrels + (side === 1 ? 1 : 0) * 0.5;
			const pos = bodyOffset.mul(side).add(bodyOffset.rotate(theta));
			reload -= Math.floor(reload);
			c.beginPath();
			c.arc(pos.x, pos.y, 0.1 * reload, 0, 2 * Math.PI, false);
			c.fill();
			c.stroke();
		}
	}
};

export const drawMultiGun = function (
	c: CanvasRenderingContext2D,
	alpha: number
) {
	const w = 0.25;
	const h = 0.25;
	const r = 0.1;

	c.strokeStyle = rgba(0, 0, 0, alpha);
	for (let a = -1; a <= 1; a += 2) {
		for (let b = -1; b <= 1; b += 2) {
			// Draw edge
			c.beginPath();
			c.moveTo(-w, h * a + r * b);
			c.lineTo(w, h * a + r * b);
			c.moveTo(w * a + r * b, -h);
			c.lineTo(w * a + r * b, h);
			c.stroke();

			// Draw gun
			c.beginPath();
			c.arc(w * a, h * b, r, 0, Math.PI * 2, false);
			c.stroke();
		}
	}
};

export const drawSpider = function (
	c: CanvasRenderingContext2D,
	alpha: number
) {
	c.save();
	c.translate(0, 0.51);

	// Draw body
	let i;
	let radius;
	let angle;
	c.fillStyle = c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	for (i = 0; i <= 21; i++) {
		angle = (0.25 + (0.5 * i) / 21) * Math.PI;
		radius = 0.6 + 0.05 * (i & 2);
		c.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius - 0.5);
	}
	c.arc(0, -0.5, 0.5, Math.PI * 0.75, Math.PI * 0.25, true);
	c.fill();

	// Draw legs
	const w = 0.9;
	drawLeg(c, w * 0.35, 0, -10, 70, 0.5);
	drawLeg(c, w * 0.15, 0, 10, 20, 0.5);
	drawLeg(c, w * -0.05, 0, -10, 20, 0.5);
	drawLeg(c, w * -0.25, 0, -20, 10, 0.5);
	drawLeg(c, w * 0.25, 0, -10, 20, 0.5);
	drawLeg(c, w * 0.05, 0, -20, 10, 0.5);
	drawLeg(c, w * -0.15, 0, -10, 70, 0.5);
	drawLeg(c, w * -0.35, 0, 10, 20, 0.5);

	c.restore();
};

export const drawButton = function (
	c: CanvasRenderingContext2D,
	alpha: number
) {
	const buttonSlices = 3;
	const buttonRadius = 0.11;

	c.fillStyle = rgba(255, 255, 255, alpha);
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	c.arc(0, 0, buttonRadius, 0, 2 * Math.PI, false);
	c.fill();
	c.stroke();

	c.beginPath();
	for (let i = 0; i < buttonSlices; i++) {
		c.moveTo(0, 0);
		const nextPos = Vector.fromAngle(i * ((2 * Math.PI) / buttonSlices)).mul(
			buttonRadius
		);
		c.lineTo(nextPos.x, nextPos.y);
	}
	c.stroke();
};

const headachePoints: { x: number; y: number }[] = [];
for (let i = 0; i < 50; i++) {
	const angle = randInRange(0, Math.PI * 2);
	const radius = Math.sqrt(Math.random()) * 0.3;
	headachePoints.push({
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius,
	});
}

export const drawHeadache = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	isRed: boolean
) {
	const headacheRadius = 0.15 * 0.75;

	// draw the ache
	c.strokeStyle = rgba(0, 0, 0, alpha);
	c.beginPath();
	for (let i = 0; i < headachePoints.length; i++) {
		const p = headachePoints[i];
		c.lineTo(p.x, p.y);
	}
	c.stroke();

	// draw the head
	c.fillStyle = rgba(255 * Number(isRed), 0, 255 * Number(!isRed), alpha);
	c.beginPath();
	c.arc(0, 0, headacheRadius, 0, 2 * Math.PI, false);
	c.fill();
	c.stroke();
};

export const drawSign = function (
	c: CanvasRenderingContext2D,
	alpha: number,
	text: string
) {
	c.save();
	c.textAlign = "center";
	c.scale(1 / 50, -1 / 50);
	c.lineWidth *= 50;

	c.save();
	c.font = "bold 34px sans-serif";
	c.fillStyle = "yellow";
	c.strokeStyle = "black";
	c.translate(0, 12);
	c.fillText("?", 0, 0);
	c.strokeText("?", 0, 0);
	c.restore();

	const textArray = splitUpText(c, text);
	const fontSize = 13;
	const xCenter = 0;
	const yCenter = -0.5 * 50 - ((fontSize + 2) * textArray.length) / 2;
	drawTextBox(c, textArray, xCenter, yCenter, fontSize);

	c.restore();
};
