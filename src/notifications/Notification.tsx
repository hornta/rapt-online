import { IconX } from "@tabler/icons-react";
import clsx from "clsx";
import {
	type ComponentPropsWithoutRef,
	forwardRef,
	type ReactNode,
} from "react";

export interface NotificationProps
	extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
	onClose?(): void;
	title?: ReactNode;
	children?: ReactNode;
	disallowClose?: boolean;
}

export const Notification = forwardRef<HTMLDivElement, NotificationProps>(
	({ className, disallowClose, title, children, onClose, ...others }, ref) => {
		const withTitle = title !== undefined;
		const title_ = withTitle ? title : children;
		const message = !withTitle ? undefined : children;

		return (
			<div
				className={clsx(
					"bg-white relative flex items-center rounded-md shadow box-border",
					className
				)}
				role="alert"
				aria-labelledby={`${others.id}-label`}
				ref={ref}
				{...others}
			>
				<div className="grow p-4">
					<div className="text-sm font-medium" id={`${others.id}-label`}>
						{title_}
					</div>

					{message && <div className="text-gray-500 text-sm">{message}</div>}
				</div>

				{!disallowClose && (
					<div className="p-2 self-start">
						<button className="p-2" aria-label="Close" onClick={onClose}>
							<IconX />
						</button>
					</div>
				)}
			</div>
		);
	}
);

Notification.displayName = "Notification";
