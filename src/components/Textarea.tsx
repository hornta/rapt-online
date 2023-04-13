import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, type TextareaHTMLAttributes } from "react";
import { COMMON_INPUT_CLASS } from "./Input";
import { Hint } from "./Hint";

export interface TextareaProps
	extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	resizable?: boolean;
	hint?: string;
	containerProps?: HTMLAttributes<HTMLDivElement>;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			className,
			["aria-invalid"]: ariaInvalid,
			resizable = true,
			hint,
			containerProps,
			...props
		},
		ref
	) => {
		return (
			<div {...containerProps}>
				<textarea
					aria-invalid={ariaInvalid}
					className={clsx(
						"w-full py-3 min-h-[100px] block",
						COMMON_INPUT_CLASS,
						resizable ? "resize-y" : "resize-none",
						className
					)}
					rows={3}
					ref={ref}
					{...props}
				/>
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

Textarea.displayName = "Textarea";
