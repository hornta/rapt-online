import { useCallback } from "react";
import { type NotificationProps } from "./notificationTypes";
import { randomId } from "@/utils/randomId";
import { useQueue } from "@/utils/useQueue";

export default function useNotificationsState({ limit }: { limit: number }) {
	const { state, queue, update, cleanQueue } = useQueue<NotificationProps>({
		initialValues: [],
		limit,
	});

	const showNotification = (notification: NotificationProps) => {
		const id = notification.id ?? randomId();

		update((notifications) => {
			if (
				notification.id &&
				notifications.some((n) => n.id === notification.id)
			) {
				return notifications;
			}

			return [...notifications, { ...notification, id }];
		});

		return id;
	};

	const updateNotification = (notification: NotificationProps) =>
		update((notifications) => {
			const index = notifications.findIndex((n) => n.id === notification.id);

			if (index === -1) {
				return notifications;
			}

			const newNotifications = [...notifications];
			newNotifications[index] = notification;

			return newNotifications;
		});

	const hideNotification = useCallback(
		(id: string) =>
			update((notifications) =>
				notifications.filter((notification) => {
					if (notification.id === id) {
						typeof notification.onClose === "function" &&
							notification.onClose(notification);
						return false;
					}

					return true;
				})
			),
		[update]
	);

	const clean = () => update(() => []);

	return {
		notifications: state,
		queue,
		showNotification,
		updateNotification,
		hideNotification,
		cleanQueue,
		clean,
	};
}
