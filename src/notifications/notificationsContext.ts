import { createContext } from "react";
import { type NotificationProps } from "./notificationTypes";

interface NotificationsContextProps {
  notifications: NotificationProps[];
  queue: NotificationProps[];
}

export const NotificationsContext = createContext<NotificationsContextProps>(
  null as any
);
