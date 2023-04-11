import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, type LabelHTMLAttributes } from "react";
import { Radio, type RadioProps } from "./Radio";

export interface RadioFieldProps extends RadioProps {
	label?: string;
	labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
	textProps?: Partial<HTMLAttributes<HTMLDivElement>>;
}

export const RadioField = forwardRef<HTMLInputElement, RadioFieldProps>(
	({ label, labelProps, textProps, ...props }, ref) => {
		const { className: labelClassName, ...extraLabelProps } = labelProps ?? {};
		const { className, ...restProps } = props;
		const { className: textClassName, ...extraTextProps } = textProps ?? {};

		return (
			<label
				className={clsx("inline-flex items-center", labelClassName)}
				{...extraLabelProps}
			>
				<Radio
					{...restProps}
					className={clsx("mr-2 shrink-0", className)}
					ref={ref}
					style={{ marginInlineEnd: 8 }}
				/>

				<div
					className={clsx(
						"text-sm font-medium cursor-pointer text-gray-700",
						textClassName
					)}
					{...extraTextProps}
				>
					{label}
				</div>
			</label>
		);
	}
);

RadioField.displayName = "RadioField";
