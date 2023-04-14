import { useRef, useEffect, useCallback, CSSProperties } from "react";
import { getAutoClose } from "./getAutoClose";
import { Notification } from "./Notification";
import { type NotificationProps } from "./notificationTypes";

interface NotificationContainerProps {
	className?: string;
	notification: NotificationProps;
	onHide(id: string): void;
	autoClose: false | number;
	innerRef: React.ForwardedRef<HTMLDivElement>;
	style?: CSSProperties;
}

export default function NotificationContainer({
	notification,
	autoClose,
	onHide,
	innerRef,
	...others
}: NotificationContainerProps) {
	const {
		autoClose: notificationAutoClose,
		message,
		...notificationProps
	} = notification;
	const autoCloseTimeout = getAutoClose(autoClose, notificationAutoClose);
	const hideTimeout = useRef<number>();

	const handleHide = useCallback(() => {
		onHide(notification.id!);
		window.clearTimeout(hideTimeout.current);
	}, [notification.id, onHide]);

	const cancelDelayedHide = () => {
		clearTimeout(hideTimeout.current);
	};

	const handleDelayedHide = useCallback(() => {
		if (typeof autoCloseTimeout === "number") {
			hideTimeout.current = window.setTimeout(handleHide, autoCloseTimeout);
		}
	}, [autoCloseTimeout, handleHide]);

	useEffect(() => {
		if (typeof notification.onOpen === "function") {
			notification.onOpen(notification);
		}
	}, [notification]);

	useEffect(() => {
		handleDelayedHide();
		return cancelDelayedHide;
	}, [autoClose, handleDelayedHide, notification.autoClose]);

	return (
		<Notification
			{...notificationProps}
			{...others}
			onClose={handleHide}
			onMouseEnter={cancelDelayedHide}
			onMouseLeave={handleDelayedHide}
			ref={innerRef}
		>
			{message}
		</Notification>
	);
}
