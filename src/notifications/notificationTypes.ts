import { type NotificationProps as NotificationComponentProps } from "./Notification";
export type NotificationsProviderPositioning = [
  "top" | "bottom",
  "left" | "right" | "center"
];

export interface NotificationProps
  extends Omit<NotificationComponentProps, "onClose"> {
  id?: string;
  message: React.ReactNode;
  autoClose?: boolean | number;
  onClose?(props: NotificationProps): void;
  onOpen?(props: NotificationProps): void;
}
