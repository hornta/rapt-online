import { COLOR_NEUTRAL } from "../game/constants.js";
import { Edge } from "../game/editor/edge.js";
import { Door } from "../game/editor/placeables/door.js";
import { drawButton } from "../game/editor/sprites.js";
import { dashedLine, rgba } from "../game/utils.js";
import { Vector } from "../game/vector.js";
import { CanvasButtonRow } from "./CanvasButtonRow.js";
import { SectionLabel } from "./SectionLabel.js";

interface WallAndButtonsPanelProps {
	onChange: (index: number) => void;
	activeIndex: number;
}

export const WallAndButtonsPanel = ({
	onChange,
	activeIndex,
}: WallAndButtonsPanelProps) => {
	return (
		<div>
			<SectionLabel description="Colored walls allow only the player of that color to pass through">
				Walls
			</SectionLabel>
			{Array.from({ length: 3 }, (_, index) => {
				return (
					<CanvasButtonRow
						key={index}
						items={[
							{
								name: "Normal",
								draw: (c) => {
									new Door(
										false,
										false,
										Math.floor((index * 2) / 2) as 0 | 1 | 2,
										new Edge(new Vector(0.4, 0.4), new Vector(-0.4, -0.4))
									).draw(c);
								},
							},
							{
								name: "One-way",
								draw: (c) => {
									new Door(
										true,
										false,
										Math.floor((index * 2 + 1) / 2) as 0 | 1 | 2,
										new Edge(new Vector(0.4, 0.4), new Vector(-0.4, -0.4))
									).draw(c);
								},
							},
						]}
						activeIndex={activeIndex}
						onChange={onChange}
						indexOffset={index * 2}
					></CanvasButtonRow>
				);
			})}
			<SectionLabel description="Buttons open and close linked doors">
				Buttons
			</SectionLabel>
			<CanvasButtonRow
				items={[
					{
						name: "Open",
						draw: (c) => {
							drawButton(c, 1);
						},
					},
					{
						name: "Close",
						draw: (c) => {
							drawButton(c, 1);
						},
					},
				]}
				activeIndex={activeIndex}
				onChange={onChange}
				indexOffset={6}
			></CanvasButtonRow>
			<CanvasButtonRow
				items={[
					{
						name: "Toggle",
						draw: (c) => {
							drawButton(c, 1);
						},
					},
				]}
				activeIndex={activeIndex}
				onChange={onChange}
				indexOffset={6 + 2}
			></CanvasButtonRow>
			<SectionLabel description="Create doors by linking walls and buttons">
				Doors
			</SectionLabel>
			<CanvasButtonRow
				items={[
					{
						name: "Link",
						draw: (c) => {
							// Draw link
							c.strokeStyle = rgba(0, 0, 0, 0.5);
							dashedLine(c, new Vector(-0.3, 0.2), new Vector(0.3, 0));

							// Draw button
							c.translate(-0.3, 0.2);
							drawButton(c, 1);
							c.translate(0.3, -0.2);

							// Draw door
							new Door(
								true,
								false,
								COLOR_NEUTRAL,
								new Edge(new Vector(0.7, 0.4), new Vector(-0.1, -0.4))
							).draw(c);
						},
					},
					{
						name: "Set Initially Open",
						draw: (c) => {
							new Door(
								true,
								true,
								COLOR_NEUTRAL,
								new Edge(new Vector(0.4, 0.4), new Vector(-0.4, -0.4))
							).draw(c);
						},
					},
				]}
				activeIndex={activeIndex}
				onChange={onChange}
				indexOffset={6 + 3}
			></CanvasButtonRow>
		</div>
	);
};
