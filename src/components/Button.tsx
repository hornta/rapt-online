import clsx from "clsx";
import { ComponentProps, useContext } from "react";
import { ButtonGroupContext } from "./ButtonGroup.js";

const buttonClass =
	'bg-gradient-to-t from-gray-200 to-white px-2 border border-gray-500 text-black rounded-lg [&:not(:disabled):not([aria-pressed="true"])]:hover:from-gray-300 aria-pressed:text-white aria-pressed:from-gray-800 aria-pressed:to-gray-600 aria-pressed:border-gray-900 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed disabled:aria-pressed:from-gray-500 disabled:aria-pressed:from-gray-400 disabled:aria-pressed:border-gray-500';

type ButtonProps = ComponentProps<"button">;

export const Button = ({ className, ...props }: ButtonProps) => {
	const buttonGroup = useContext(ButtonGroupContext);

	let buttonGroupClass: string | null = null;
	if (buttonGroup === null) {
		buttonGroupClass =
			"mr-[-1px] rounded-none first:rounded-l-lg last:rounded-r-lg";
	}
	return (
		<button
			className={clsx(buttonClass, buttonGroupClass, className)}
			{...props}
		/>
	);
};
