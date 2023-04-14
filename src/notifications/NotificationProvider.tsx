import { type ComponentPropsWithoutRef, useRef } from "react";
import { Transition, TransitionGroup } from "react-transition-group";
import { useNotificationsEvents } from "./events";
import getNotificationStateStyles from "./getNotificationStateStyles";
import { getPositionStyles } from "./getPositionStyles";
import NotificationContainer from "./NotificationContainer";
import { NotificationsContext } from "./notificationsContext";
import { type NotificationsProviderPositioning } from "./notificationTypes";
import useNotificationsState from "./useNotificationState";
import styles from "./NotificationProvider.module.css";
import { clsx } from "clsx";
import { useDidUpdate } from "@/utils/useDidUpdate";
import { useForceUpdate } from "@/utils/useForceUpdate";
import { PortalProps, Portal } from "@/components/Portal";

const POSITIONS = [
	"top-left",
	"top-right",
	"top-center",
	"bottom-left",
	"bottom-right",
	"bottom-center",
] as const;

interface NotificationProviderProps extends ComponentPropsWithoutRef<"div"> {
	position?:
		| "top-left"
		| "top-right"
		| "top-center"
		| "bottom-left"
		| "bottom-right"
		| "bottom-center";

	autoClose?: number | false;
	transitionDuration?: number;
	containerWidth?: number;
	notificationMaxHeight?: number;
	limit?: number;
	children?: React.ReactNode;
	target?: PortalProps["target"];
}

export function NotificationsProvider({
	className,
	position = "top-center",
	autoClose = 4000,
	transitionDuration = 250,
	containerWidth = 440,
	notificationMaxHeight = 200,
	limit = 5,
	style,
	children,
	target,
	...others
}: NotificationProviderProps) {
	const forceUpdate = useForceUpdate();
	const refs = useRef<Record<string, HTMLDivElement>>({});
	const previousLength = useRef<number>(0);
	const {
		notifications,
		queue,
		showNotification,
		updateNotification,
		hideNotification,
		clean,
		cleanQueue,
	} = useNotificationsState({ limit });

	const duration = transitionDuration;
	const positioning = (
		POSITIONS.includes(position) ? position : "bottom-right"
	).split("-") as NotificationsProviderPositioning;

	useDidUpdate(() => {
		if (notifications.length > previousLength.current) {
			setTimeout(() => forceUpdate(), 0);
		}
		previousLength.current = notifications.length;
	}, [notifications]);

	useNotificationsEvents({
		show: showNotification,
		hide: hideNotification,
		update: updateNotification,
		clean,
		cleanQueue,
	});

	const items = notifications.map((notification) => (
		<Transition
			key={notification.id}
			timeout={duration}
			onEnter={() => refs.current[notification.id!].offsetHeight}
			nodeRef={{ current: refs.current[notification.id!] }}
		>
			{(state) => (
				<NotificationContainer
					innerRef={(node) => {
						if (node !== null) {
							refs.current[notification.id!] = node;
						}
					}}
					notification={notification}
					onHide={hideNotification}
					className={styles.notification}
					autoClose={autoClose}
					style={{
						...getNotificationStateStyles({
							state,
							positioning,
							transitionDuration: duration,
							maxHeight: notificationMaxHeight,
						}),
					}}
				/>
			)}
		</Transition>
	));

	return (
		<NotificationsContext.Provider value={{ notifications, queue }}>
			<Portal target={target}>
				<div
					className={clsx(styles.notifications, className)}
					style={{
						...style,
						maxWidth: containerWidth,
						...getPositionStyles(positioning, 16),
					}}
					{...others}
				>
					<TransitionGroup>{items}</TransitionGroup>
				</div>
			</Portal>

			{children}
		</NotificationsContext.Provider>
	);
}
