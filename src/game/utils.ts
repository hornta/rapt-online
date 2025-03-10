import { TEXT_BOX_X_MARGIN, TEXT_BOX_Y_MARGIN } from "./constants";
import { Edge } from "./editor/edge";
import { Vector } from "./vector";

export type TupleOf<T, N extends number> = N extends N
	? number extends N
		? Readonly<T[]>
		: Readonly<_TupleOf<T, N, []>>
	: never;
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
	? R
	: _TupleOf<T, N, [T, ...R]>;

export function drawTextBox(
	c: CanvasRenderingContext2D,
	textArray: string[],
	xCenter: number,
	yCenter: number,
	textSize: number
) {
	const numLines = textArray.length;
	if (numLines < 1) {
		return;
	}

	// Calculate the height of all lines and the widest line's width
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

	// Draw the box
	c.fillStyle = "#BFBFBF";
	c.strokeStyle = "#7F7F7F";
	c.lineWidth = 1;
	const xLeft = xCenter - textWidth / 2 - TEXT_BOX_X_MARGIN;
	const yBottom = yCenter - textHeight / 2 - TEXT_BOX_Y_MARGIN;
	c.fillRect(
		xLeft,
		yBottom,
		textWidth + TEXT_BOX_X_MARGIN * 2,
		textHeight + TEXT_BOX_Y_MARGIN * 2
	);
	c.strokeRect(
		xLeft,
		yBottom,
		textWidth + TEXT_BOX_X_MARGIN * 2,
		textHeight + TEXT_BOX_Y_MARGIN * 2
	);

	// Draw the text
	c.fillStyle = "black";
	c.textAlign = "center";
	// yCurr starts at the top, so subtract half of height of box
	let yCurr = yCenter + 4 - ((numLines - 1) * lineHeight) / 2;
	for (let i = 0; i < numLines; ++i) {
		c.fillText(textArray[i], xCenter, yCurr);
		yCurr += lineHeight;
	}
}

export function adjustAngleToTarget(
	currAngle: number,
	targetAngle: number,
	maxRotation: number
) {
	if (targetAngle - currAngle > Math.PI) {
		currAngle += 2 * Math.PI;
	} else if (currAngle - targetAngle > Math.PI) {
		currAngle -= 2 * Math.PI;
	}

	let deltaAngle = targetAngle - currAngle;
	if (Math.abs(deltaAngle) > maxRotation) {
		deltaAngle = deltaAngle > 0 ? maxRotation : -maxRotation;
	}
	currAngle += deltaAngle;
	currAngle -= Math.floor(currAngle / (2 * Math.PI)) * (2 * Math.PI);
	return currAngle;
}

export function rgba(r: number, g: number, b: number, a: number) {
	return "rgba(" + r + ", " + g + ", " + b + ", " + a.toFixed(5) + ")";
}

const HELP_SIGN_TEXT_WIDTH = 1.5;

export function splitUpText(c: CanvasRenderingContext2D, phrase: string) {
	const words = phrase.split(" ");
	const phraseArray = [];
	let lastPhrase = "";
	c.font = "12px sans serif";
	const maxWidth = HELP_SIGN_TEXT_WIDTH * 50;
	let measure = 0;
	for (let i = 0; i < words.length; ++i) {
		const word = words[i];
		measure = c.measureText(lastPhrase + word).width;
		if (measure < maxWidth) {
			lastPhrase += " " + word;
		} else {
			if (lastPhrase.length > 0) {
				phraseArray.push(lastPhrase);
			}
			lastPhrase = word;
		}
		if (i === words.length - 1) {
			phraseArray.push(lastPhrase);
			break;
		}
	}
	return phraseArray;
}

export function dashedLine(
	c: CanvasRenderingContext2D,
	start: Vector,
	end: Vector
) {
	let dir = end.sub(start);
	const n = dir.length() * 10;
	dir = dir.div(n);
	c.beginPath();
	let i = 0;
	for (; i + 1 < n; i += 2) {
		c.moveTo(start.x, start.y);
		start = start.add(dir);
		c.lineTo(start.x, start.y);
		start = start.add(dir);
	}
	if (i < n) {
		c.moveTo(start.x, start.y);
		start = start.add(dir.mul(n - i));
		c.lineTo(start.x, start.y);
	}
	c.stroke();
}

export const getClosestEdge = (point: Vector, edges: Edge[]) => {
	let edge = null;
	let minDistance = Number.MAX_VALUE;
	for (let i = 0; i < edges.length; i++) {
		const distance = edges[i].squaredDistanceToPoint(point);
		if (distance < minDistance) {
			minDistance = distance;
			edge = edges[i];
		}
	}
	return edge;
};
