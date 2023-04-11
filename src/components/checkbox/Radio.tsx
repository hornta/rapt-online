import { clsx } from "clsx";
import { forwardRef } from "react";
import { COMMON_CHECKBOX_RADIO, COMMON_CLASS } from "./checkboxUtils";

export type RadioProps = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
	({ className, ...props }, ref) => {
		return (
			<input
				type="radio"
				className={clsx(
					COMMON_CLASS,
					COMMON_CHECKBOX_RADIO,
					"rounded-full checked:bg-purple-500 checked:shadow-[0_0_0_4px_#f0f0fa_inset,0_0_0_4px_#f0f0fa_inset] disabled:checked:shadow-[0_0_0_4px_#f8f8f8_inset,0_0_0_4px_#f8f8f8_inset] disabled:checked:bg-gray-200",
					className
				)}
				{...props}
				ref={ref}
			/>
		);
	}
);

Radio.displayName = "Radio";
