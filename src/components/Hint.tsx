import clsx from "clsx";
import { HTMLAttributes } from "react";

interface HintProps extends HTMLAttributes<HTMLDivElement> {
	error?: boolean;
}

export const Hint = ({ error, children, className, ...props }: HintProps) => {
	return (
		<div
			className={clsx(
				"text-sm font-normal mt-1",
				error ? "text-red-500" : "text-gray-500",
				className
			)}
			{...props}
		>
			{children}
		</div>
	);
};
