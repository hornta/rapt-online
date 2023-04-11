import { neutralEnemies, colorEnemies } from "../game/editor/enemies.js";
import { CanvasButtonRow } from "./CanvasButtonRow.jsx";
import { SectionLabel } from "./SectionLabel.jsx";

const splitIntoGroupsOfSize = <T,>(items: T[], size: number) => {
	return items.reduce<T[][]>((acc, curr, i) => {
		if (i % size === 0) {
			acc.push([]);
		}
		acc[acc.length - 1].push(curr);
		return acc;
	}, []);
};

const neutralEnemiesGroup = splitIntoGroupsOfSize(neutralEnemies, 2);
const colorEnemiesGroup = splitIntoGroupsOfSize(colorEnemies, 2);

interface EnemiesPanelProps {
	onChange: (index: number) => void;
	activeIndex: number;
}

export const EnemiesPanel = ({ onChange, activeIndex }: EnemiesPanelProps) => {
	return (
		<div>
			<SectionLabel>Color-neutral enemies</SectionLabel>
			{neutralEnemiesGroup.map((enemies, index) => {
				return (
					<CanvasButtonRow
						key={index}
						items={enemies}
						indexOffset={index * 2}
						onChange={onChange}
						activeIndex={activeIndex}
					/>
				);
			})}
			<SectionLabel>Color-specific enemies</SectionLabel>
			{colorEnemiesGroup.map((enemies, index) => {
				return (
					<CanvasButtonRow
						key={enemies[0].name}
						items={enemies}
						indexOffset={neutralEnemiesGroup.length * 2 + index * 2}
						onChange={onChange}
						activeIndex={activeIndex}
					/>
				);
			})}
		</div>
	);
};
