import { clsx } from "clsx";
import {
	forwardRef,
	type HTMLAttributes,
	type InputHTMLAttributes,
} from "react";
import { Hint } from "./Hint";

export const COMMON_INPUT_CLASS =
	"w-full text-sm px-3 border border-gray-400 rounded-[8px] shadow-[0px_1px_2px_rgba(16,24,40,0.05)] focus:border-purple-600 aria-[invalid=true]:border-error-300 focus:outline outline-4 outline-purple-100 aria-[invalid=true]:outline-error-100";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	containerProps?: HTMLAttributes<HTMLDivElement>;
	hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			type,
			["aria-invalid"]: ariaInvalid,
			containerProps,
			hint,
			...props
		},
		ref
	) => {
		return (
			<div {...containerProps}>
				<div className="flex items-center">
					<div className="relative grow">
						<input
							type={type}
							aria-invalid={ariaInvalid}
							className={clsx(
								"outline-offset-0 font-normal bg-white block h-[40px]",
								COMMON_INPUT_CLASS,
								className
							)}
							ref={ref}
							{...props}
						/>
					</div>
				</div>
				{hint && (
					<Hint
						className="inline-block"
						error={
							ariaInvalid !== false &&
							ariaInvalid !== "false" &&
							ariaInvalid !== undefined
						}
					>
						{hint}
					</Hint>
				)}
			</div>
		);
	}
);

Input.displayName = "Input";
