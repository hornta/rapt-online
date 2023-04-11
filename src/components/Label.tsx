import { clsx } from "clsx";
import { type ReactNode, type LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
	children?: ReactNode;
	for?: string;
}

export const Label = ({ children, className, ...props }: LabelProps) => {
	return (
		<label
			className={clsx(
				"text-sm font-medium text-gray-700 inline-block pb-1",
				className
			)}
			{...props}
		>
			{children}
		</label>
	);
};
