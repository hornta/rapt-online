import Link from "next/link";
import { LEVEL_DATA } from "./game/levels";

export const Start = () => {
	return (
		<>
			<Link href="editor">Editor</Link>

			<h2 className="font-medium text-lg">Official levels</h2>
			<ul>
				{Object.entries(LEVEL_DATA).map(([key]) => {
					return (
						<li key={key}>
							<Link href={"level/" + key}>{key}</Link>
						</li>
					);
				})}
			</ul>
		</>
	);
};
