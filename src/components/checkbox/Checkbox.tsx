import { clsx } from "clsx";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { COMMON_CHECKBOX_RADIO, COMMON_CLASS } from "./checkboxUtils";

export interface CheckboxProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ indeterminate, className, ...props }, forwardedRef) => {
    const [ref, setRef] = useState<HTMLInputElement | undefined>();

    useEffect(() => {
      if (ref) {
        if (indeterminate) {
          ref.indeterminate = true;
        } else {
          ref.indeterminate = false;
        }
      }
    }, [ref, indeterminate]);

    useImperativeHandle(forwardedRef, () => ref!, [ref]);

    return (
      <input
        type="checkbox"
        className={clsx(
          COMMON_CLASS,
          COMMON_CHECKBOX_RADIO,
          "rounded-[4px] checked:bg-purple-25 indeterminate:bg-purple-25 [&:not(:disabled)]:checked:bg-checkbox-checked [&:not(:disabled)]:indeterminate:bg-checkbox-indeterminate bg-center bg-no-repeat bg-[length:12px_12px] indeterminate:border-purple-500 checked:stroke-purple-500 indeterminate:stroke-purple-500 disabled:checked:bg-checkbox-checked-disabled disabled:indeterminate:bg-checkbox-indeterminate-disabled",
          className
        )}
        {...props}
        ref={(element) => {
          if (element) {
            setRef(element);
          }
        }}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";
