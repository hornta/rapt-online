import { useRef, useLayoutEffect } from "react";
import { GAME_SCALE } from "../game/constants.js";
import {
	spriteTemplates,
	SPRITE_ROCKET_SPIDER,
	Sprite,
} from "../game/editor/placeables/sprite.js";
import { Vector } from "../game/vector.js";

const cellClass =
	"w-1/2 text-xs text-center h-[80px] border-b border-b first:border-r aria-pressed:bg-gray-200 hover:bg-gray-100 aria-pressed:shadow-inner transition-colors transition-shadow";

export const canvasWidth = 80;
export const canvasHeight = 60;

export type CanvasItem = {
	name: string;
	sprite?: Sprite;
	draw?: (c: CanvasRenderingContext2D) => void;
};

interface CanvasButtonProps {
	item: CanvasItem;
	onClick: () => void;
	active: boolean;
}

export const CanvasButton = ({ item, onClick, active }: CanvasButtonProps) => {
	const ref = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		if (ref.current) {
			const c = ref.current.getContext("2d")!;
			c.translate(canvasWidth / 2, canvasHeight / 2);
			c.scale(GAME_SCALE, -GAME_SCALE);
			c.lineWidth = 1 / GAME_SCALE;
			c.fillStyle = c.strokeStyle = "green";

			if (item.sprite === spriteTemplates[SPRITE_ROCKET_SPIDER].sprite) {
				const sprite = item.sprite.clone(new Vector(0, -0.2));
				sprite.draw(c);
			} else {
				if (item.sprite) {
					item.sprite?.draw(c);
				} else {
					item.draw?.(c);
				}
			}
		}
	}, [item]);

	return (
		<button className={cellClass} onClick={onClick} aria-pressed={active}>
			<canvas
				width={canvasWidth}
				height={canvasHeight}
				className="mx-auto"
				ref={ref}
			></canvas>
			{item.name}
		</button>
	);
};
