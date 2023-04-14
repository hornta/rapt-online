import { Button } from "@/components/Button";
import { prisma } from "@/prisma";
import Link from "next/link";

export default async function Home() {
	const levels = await prisma.level.findMany({
		orderBy: { createdBy: "desc" },
	});

	return (
		<div className="flex justify-center py-10 gap-x-4">
			<div className="border border-lime-800 bg-lime-200">
				<h2 className="font-bold p-2 border-b border-b-lime-800">
					Official levels
				</h2>
				<ul>
					{levels.map((level) => {
						return (
							<li key={level.id}>
								<Link
									href={"level/" + level.id}
									className="hover:bg-lime-500 hover:text-white px-2 py-1 block"
								>
									{level.name}
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
			<div className="w-48">
				<Link href="editor">To the editor</Link>
			</div>
		</div>
	);
}
