import { Button } from "./Button.jsx";
import { ButtonGroup } from "./ButtonGroup.jsx";

interface ToggleButtonGroupProps {
	label?: string;
	buttons: { value: string; label: string; disabled: boolean }[];
	selected: string;
	onChange: (value: string) => void;
}

export const ToggleButtonGroup = ({
	label,
	buttons,
	selected,
	onChange,
}: ToggleButtonGroupProps) => {
	return (
		<div className="inline-flex flex-col items-center gap-y-1">
			<div className="flex flex-wrap">
				<ButtonGroup>
					{buttons.map((button) => {
						return (
							<Button
								key={button.value}
								aria-pressed={button.value === selected}
								onClick={() => {
									onChange(button.value);
								}}
								disabled={button.disabled}
							>
								{button.label}
							</Button>
						);
					})}
				</ButtonGroup>
			</div>
			{label && <div>{label}</div>}
		</div>
	);
};
