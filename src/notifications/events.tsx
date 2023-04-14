import { type NotificationProps } from "./notificationTypes";
import { createUseExternalEvents } from "@/utils/createUseExternalEvents";

type NotificationsEvents = {
	show(notification: NotificationProps): void;
	hide(id: string): void;
	update(notification: NotificationProps & { id: string }): void;
	clean(): void;
	cleanQueue(): void;
};

const [useNotificationsEvents, createEvent] =
	createUseExternalEvents<NotificationsEvents>("rapt-notifications");

// eslint-disable-next-line import/no-unused-modules
export { useNotificationsEvents };

const showNotification = createEvent("show");

export const showSuccessNotification = (
	props: Omit<NotificationProps, "icon" | "iconColor">
) => {
	showNotification({
		...props,
	});
};

export const showErrorNotification = (
	props: Omit<NotificationProps, "icon" | "iconColor">
) => {
	showNotification({
		...props,
	});
};
