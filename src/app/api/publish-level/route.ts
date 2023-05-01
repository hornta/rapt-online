import { prisma } from "@/prisma";
import { levelDataSchema } from "@/schemas";
import { getAuth } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
	name: z.string(),
	description: z.string(),
	one_player: z.boolean(),
	two_players: z.boolean(),
	levelData: levelDataSchema,
});

export async function POST(request: NextRequest) {
	const { userId } = getAuth(request);

	if (userId === null) {
		return new Response(undefined, { status: 401 });
	}

	const parseBody = schema.safeParse(await request.json());
	if (!parseBody.success) {
		return new Response(JSON.stringify(parseBody.error, null, 2), {
			status: 400,
		});
	}
	const { data: body } = parseBody;

	let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });

	if (user === null) {
		user = await prisma.user.create({
			data: { clerkUserId: userId, role: Role.User },
		});
	}

	try {
		const level = await prisma.level.create({
			data: {
				name: body.name,
				description: body.description,
				data: body.levelData,
				one_player: body.one_player,
				two_players: body.two_players,
				createdById: user.id,
			},
		});

		return new Response(
			JSON.stringify({
				level: level,
			})
		);
	} catch (e) {
		console.error(e);
		return new Response("Unknown error", {
			status: 500,
		});
	}
}
