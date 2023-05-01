import { env } from "@/env";
import { prisma } from "@/prisma";
import { Role } from "@prisma/client";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";

const headerSchema = z.object({
	["svix-id"]: z.string(),
	["svix-signature"]: z.string(),
	["svix-timestamp"]: z.coerce.number().int(),
});

const webhookEventSchema = z.object({
	type: z.literal("user.created"),
	data: z.object({ id: z.string() }),
});

const WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60;

const verifyTimestamp = (timestamp: number) => {
	const now = Math.floor(Date.now() / 1000);
	if (Number.isNaN(timestamp)) {
		throw new Error("Invalid Signature Headers");
	}

	if (now - timestamp > WEBHOOK_TOLERANCE_IN_SECONDS) {
		throw new Error("Message timestamp too old");
	}
	if (timestamp > now + WEBHOOK_TOLERANCE_IN_SECONDS) {
		throw new Error("Message timestamp too new");
	}
	return new Date(timestamp * 1000);
};

const sign = (msgId: string, timestamp: Date, payload: string) => {
	const encoder = new TextEncoder();
	const timestampNumber = Math.floor(timestamp.getTime() / 1000);
	const toSign = encoder.encode(`${msgId}.${timestampNumber}.${payload}`);
	const expectedSignature = createHmac("sha256", env.SVIX_SIGNING_KEY)
		.update(toSign)
		.digest("base64");
	return `v1,${expectedSignature}`;
};

const verify = async (request: Request) => {
	const headers = headerSchema.parse(Object.fromEntries(request.headers));
	const timestamp = verifyTimestamp(headers["svix-timestamp"]);
	const json = await request.json();
	const computedSignature = sign(
		headers["svix-id"],
		timestamp,
		JSON.stringify(json)
	);
	const expectedSignature = computedSignature.split(",")[1];
	const passedSignatures = headers["svix-signature"].split(" ");

	const encoder = new globalThis.TextEncoder();
	for (const versionedSignature of passedSignatures) {
		const [version, signature] = versionedSignature.split(",");
		if (version !== "v1") {
			continue;
		}

		if (
			timingSafeEqual(
				encoder.encode(signature),
				encoder.encode(expectedSignature)
			)
		) {
			return webhookEventSchema.parse(JSON.parse(json));
		}
	}
	throw new Error("No matching signature found");
};

export async function POST(request: NextRequest) {
	try {
		const body = await verify(request);
		if (body.type === "user.created") {
			await prisma.user.create({
				data: { clerkUserId: body.data.id, role: Role.User },
			});
		}
	} catch (err) {
		console.log(err);
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
