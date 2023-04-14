import { useContext } from "react";
import { NotificationsContext } from "./notificationsContext";

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications hook was called outside of NotificationsProvider context"
    );
  }

  return context;
}
