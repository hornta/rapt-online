import { clsx } from "clsx";
import { forwardRef, type LabelHTMLAttributes } from "react";
import { Switch, type SwitchProps } from "./Switch";

export interface SwitchFieldProps extends SwitchProps {
	label?: string;
	labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
}

export const SwitchField = forwardRef<HTMLInputElement, SwitchFieldProps>(
	({ label, labelProps, ...props }, ref) => {
		const { className: labelClassName, ...extraLabelProps } = labelProps ?? {};
		const { className, ...restProps } = props;

		return (
			<label
				className={clsx("inline-flex items-center", labelClassName)}
				{...extraLabelProps}
			>
				<Switch
					className={clsx("mr-2 shrink-0", className)}
					{...restProps}
					ref={ref}
				/>
				<span className="text-sm font-medium cursor-pointer text-gray-700">
					{label}
				</span>
			</label>
		);
	}
);

SwitchField.displayName = "SwitchField";
