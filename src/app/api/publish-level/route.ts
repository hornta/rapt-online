import { cookies } from "next/headers";

export async function POST(request: Request) {
	const cookieStore = cookies();
	const { searchParams } = new URL(request.url);

	return new Response(
		JSON.stringify({
			body: request.body,
			cookies: cookieStore.getAll(),
			query: searchParams,
		})
	);
}
