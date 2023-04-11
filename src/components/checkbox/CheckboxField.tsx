import { clsx } from "clsx";
import { forwardRef, type LabelHTMLAttributes, type ReactNode } from "react";
import { Checkbox, type CheckboxProps } from "./Checkbox";

export interface CheckboxFieldProps extends Omit<CheckboxProps, "children"> {
	label?: ReactNode | string;
	labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
	({ label, labelProps, ...props }, ref) => {
		const { className: labelClassName, ...extraLabelProps } = labelProps ?? {};
		const { className, ...restProps } = props;

		return (
			<label
				className={clsx("inline-flex items-center", labelClassName)}
				{...extraLabelProps}
			>
				<Checkbox
					className={clsx("mr-2 shrink-0", className)}
					{...restProps}
					ref={ref}
				/>
				{typeof label === "string" ? (
					<span className="text-sm font-medium cursor-pointer text-gray-700">
						{label}
					</span>
				) : (
					label
				)}
			</label>
		);
	}
);

CheckboxField.displayName = "CheckboxField";
