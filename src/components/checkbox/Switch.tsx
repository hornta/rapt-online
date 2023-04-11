import { clsx } from "clsx";
import { forwardRef } from "react";
import { COMMON_CLASS } from "./checkboxUtils";

const SWITCH_CIRCLE_CLASS =
	"before:w-[16px] before:h-[16px] before:bg-white before:rounded-full before:absolute before:top-[2px] before:left-[2px] before:checked:translate-x-[16px] before:transition-transform before:shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06),0px_1px_3px_0px_rgba(16,24,40,0.1)]";

export type SwitchProps = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
	({ className, ...props }, ref) => {
		return (
			<input
				type="checkbox"
				role="switch"
				className={clsx(
					COMMON_CLASS,
					"w-[36px] h-[20px] bg-gray-100 rounded-[12px] [&:not(:disabled):not(:checked)]:hover:bg-gray-200 checked:bg-purple-500 disabled:checked:bg-purple-100 relative transition-colors",
					SWITCH_CIRCLE_CLASS,
					className
				)}
				{...props}
				ref={ref}
			/>
		);
	}
);

Switch.displayName = "Switch";
