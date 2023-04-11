import { clsx } from "clsx";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { COMMON_INPUT_CLASS } from "./Input.jsx";

export interface TextareaProps
	extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	resizable?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{ className, ["aria-invalid"]: ariaInvalid, resizable = true, ...props },
		ref
	) => {
		return (
			<div>
				<textarea
					aria-invalid={ariaInvalid}
					className={clsx(
						"w-full py-3 min-h-[100px]",
						COMMON_INPUT_CLASS,
						resizable ? "resize-y" : "resize-none",
						className
					)}
					rows={3}
					ref={ref}
					{...props}
				/>
			</div>
		);
	}
);

Textarea.displayName = "Textarea";
