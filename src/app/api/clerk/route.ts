import { env } from "@/env";
import { prisma } from "@/prisma";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { z } from "zod";

const wh = new Webhook(env.SVIX_SIGNING_KEY);

const headerSchema = z.object({
	["svix-id"]: z.string(),
	["svix-signature"]: z.string(),
	["svix-timestamp"]: z.string(),
});

const userCreatedSchema = z.object({
	type: z.literal("user.created"),
	data: z.object({ id: z.string() }),
});

export async function POST(request: NextRequest) {
	try {
		const headers = headerSchema.parse(Object.fromEntries(request.headers));
		const msg = wh.verify(JSON.stringify(await request.json()), headers);
		const body = userCreatedSchema.parse(msg);
		if (body.type === "user.created") {
			await prisma.user.create({
				data: { clerkUserId: body.data.id, role: Role.User },
			});
		}
	} catch (err) {
		if (err instanceof Error) {
			return new Response(JSON.stringify(err, null, 2), {
				status: 400,
				headers: { ["Content-Type"]: "application/json" },
			});
		}
		return new Response("Unknown error", {
			status: 400,
		});
	}
}
