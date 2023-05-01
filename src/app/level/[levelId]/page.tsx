import { Game } from "@/game";
import { prisma } from "@/prisma";
import { levelDataSchema } from "@/schemas";

export default async function Page({
	params,
}: {
	params: { levelId: string };
}) {
	const numericId = Number(params.levelId);
	if (Number.isNaN(numericId)) {
		return "404";
	}
	const level = await prisma.level.findUnique({
		where: { id: Number(params.levelId) },
	});
	if (level === null) {
		return "404";
	}
	return <Game level={levelDataSchema.parse(level.data)} />;
}
