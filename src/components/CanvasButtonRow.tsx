import { CanvasButton, CanvasItem } from "./CanvasButton.js";

interface CanvasButtonRowProps {
	items: CanvasItem[];
	indexOffset: number;
	onChange: (index: number) => void;
	activeIndex: number;
}

export const CanvasButtonRow = ({
	items,
	indexOffset,
	onChange,
	activeIndex,
}: CanvasButtonRowProps) => {
	return (
		<div>
			{items.map((enemy, index) => {
				const enemyIndex = indexOffset + index;
				return (
					<CanvasButton
						active={activeIndex === enemyIndex}
						key={index}
						item={enemy}
						onClick={() => {
							onChange(enemyIndex);
						}}
					/>
				);
			})}
		</div>
	);
};
