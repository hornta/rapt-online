import { CanvasItem } from "../../components/CanvasButton.js";
import { COLOR_BLUE, COLOR_RED } from "../constants.js";
import { Vector } from "../vector.js";
import {
	spriteTemplates,
	SPRITE_BOMBER,
	SPRITE_DOOM_MAGNET,
	SPRITE_HUNTER,
	SPRITE_MULTI_GUN,
	SPRITE_POPPER,
	SPRITE_JET_STREAM,
	SPRITE_ROCKET_SPIDER,
	SPRITE_SPIKE_BALL,
	SPRITE_WALL_CRAWLER,
	SPRITE_WHEELIGATOR,
	SPRITE_BOUNCY_ROCKET_LAUNCHER,
	SPRITE_CORROSION_CLOUD,
	SPRITE_GRENADIER,
	SPRITE_HEADACHE,
	SPRITE_SHOCK_HAWK,
	SPRITE_STALACBAT,
	SPRITE_WALL_AVOIDER,
	Sprite,
} from "./placeables/sprite.js";

export const neutralEnemies: CanvasItem[] = [
	spriteTemplates[SPRITE_BOMBER],
	spriteTemplates[SPRITE_DOOM_MAGNET],
	spriteTemplates[SPRITE_HUNTER],
	spriteTemplates[SPRITE_MULTI_GUN],
	spriteTemplates[SPRITE_POPPER],
	spriteTemplates[SPRITE_JET_STREAM],
	spriteTemplates[SPRITE_ROCKET_SPIDER],
	spriteTemplates[SPRITE_SPIKE_BALL],
	spriteTemplates[SPRITE_WALL_CRAWLER],
	spriteTemplates[SPRITE_WHEELIGATOR],
];

export const colorEnemies: CanvasItem[] = [
	spriteTemplates[SPRITE_BOUNCY_ROCKET_LAUNCHER],
	spriteTemplates[SPRITE_CORROSION_CLOUD],
	spriteTemplates[SPRITE_GRENADIER],
	spriteTemplates[SPRITE_HEADACHE],
	spriteTemplates[SPRITE_SHOCK_HAWK],
	spriteTemplates[SPRITE_STALACBAT],
	spriteTemplates[SPRITE_WALL_AVOIDER],
].flatMap((enemy) => {
	return [
		{ ...enemy, sprite: enemy.sprite.clone(new Vector(0, 0), COLOR_RED) },
		{ ...enemy, sprite: enemy.sprite.clone(new Vector(0, 0), COLOR_BLUE) },
	];
});

export const enemies = [...neutralEnemies, ...colorEnemies];
