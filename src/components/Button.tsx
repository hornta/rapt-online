"use client";

import clsx from "clsx";
import { ComponentProps, useContext } from "react";
import { ButtonGroupContext } from "./ButtonGroup";

const buttonClass =
	"inline-flex justify-center items-center appearance-none bg-gradient-to-t from-gray-200 to-white px-2 border border-gray-500 text-black rounded-lg aria-pressed:text-white aria-pressed:from-gray-800 aria-pressed:to-gray-600 aria-pressed:border-gray-900";

const secondaryClass =
	'[&:not(:disabled):not([aria-pressed="true"])]:hover:from-gray-300 disabled:text-gray-500 disabled:border-gray-400 disabled:aria-pressed:from-gray-500 disabled:aria-pressed:from-gray-400 disabled:aria-pressed:border-gray-500';
interface ButtonProps extends ComponentProps<"button"> {
	variant?: "secondary" | "primary";
	destructive?: boolean;
	isLoading?: boolean;
}

export const Button = ({
	className,
	variant = "secondary",
	destructive = false,
	isLoading = false,
	children,
	disabled,
	...props
}: ButtonProps) => {
	const buttonGroup = useContext(ButtonGroupContext);

	let buttonGroupClass: string | null = null;
	if (typeof buttonGroup === "boolean") {
		buttonGroupClass =
			"mr-[-1px] rounded-none first:rounded-l-lg last:rounded-r-lg";
	}
	return (
		<button
			className={clsx(
				buttonClass,
				buttonGroupClass,
				variant === "primary"
					? "from-purple-900 to-purple-600 text-white border-purple-900 [&:not(:disabled)]:hover:to-purple-800 disabled:opacity-60"
					: secondaryClass,
				destructive && "bg-red-700 text-white",
				isLoading && "relative",
				"disabled:cursor-not-allowed",
				className
			)}
			disabled={disabled}
			{...props}
		>
			{isLoading && (
				<div className="absolute inline-flex">
					<span className="animate-spin w-4 h-4 rounded-full border-2 border-t-current border-r-current border-l-transparent border-b-transparent" />
				</div>
			)}
			<span className={clsx("text-left", isLoading && "opacity-0")}>
				{children}
			</span>
		</button>
	);
};
