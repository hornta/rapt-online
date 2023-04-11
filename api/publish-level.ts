import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuth } from "@clerk/nextjs/server";

export default function handler(
	request: VercelRequest,
	response: VercelResponse
) {
	const { userId } = getAuth(request);
	if (!userId) {
		response.status(401).json({ error: "Not authenticated" });
		return;
	}

	response.status(200).json({
		body: request.body,
		query: request.query,
		cookies: request.cookies,
	});
}
