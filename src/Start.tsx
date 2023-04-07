import { Link } from "react-router-dom";
import { LEVEL_DATA } from "./game/levels.js";

export const Start = () => {
	return (
		<ul>
			{Object.entries(LEVEL_DATA).map(([key]) => {
				return (
					<li key={key}>
						<Link to={"level/" + key}>{key}</Link>
					</li>
				);
			})}
		</ul>
	);
};
