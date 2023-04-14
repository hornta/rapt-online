"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { NotificationsProvider } from "./notifications/NotificationProvider";

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<Provider store={store}>
			<NotificationsProvider>{children}</NotificationsProvider>
		</Provider>
	);
}
