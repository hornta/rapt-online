import { z } from "zod";

export const enemyType = z.enum([
	"wall avoider",
	"corrosion cloud",
	"rocket spider",
	"hunter",
	"stalacbat",
	"shock hawk",
	"wall crawler",
	"jet stream",
	"bomber",
	"doom magnet",
	"popper",
	"multi gun",
	"grenadier",
	"spike ball",
	"bouncy rocket launcher",
	"headache",
	"wheeligator",
]);

export const entitySchema = z.discriminatedUnion("class", [
	z
		.object({
			class: z.literal("wall"),
			color: z.number(),
			end: z.tuple([z.number(), z.number()]),
			start: z.tuple([z.number(), z.number()]),
			oneway: z.boolean(),
			open: z.boolean(),
		})
		.strict(),
	z
		.object({
			class: z.literal("cog"),
			pos: z.tuple([z.number(), z.number()]),
		})
		.strict(),
	z
		.object({
			class: z.literal("button"),
			type: z.union([z.literal(0), z.literal(1), z.literal(2)]),
			pos: z.tuple([z.number(), z.number()]),
			walls: z.array(z.number()),
		})
		.strict(),
	z
		.object({
			class: z.literal("enemy"),
			pos: z.tuple([z.number(), z.number()]),
			type: enemyType,
			angle: z.number(),
			color: z.number(),
		})
		.strict(),
	z
		.object({
			class: z.literal("sign"),
			pos: z.tuple([z.number(), z.number()]),
			text: z.string(),
		})
		.strict(),
]);

export type Entity = z.infer<typeof entitySchema>;

export const levelDataSchema = z
	.object({
		unique_id: z.number(),
		end: z.tuple([z.number(), z.number()]),
		start: z.tuple([z.number(), z.number()]),
		height: z.number(),
		width: z.number(),
		cells: z.array(z.array(z.number())),
		entities: z.array(entitySchema),
	})
	.strict();

export type LevelData = z.infer<typeof levelDataSchema>;
