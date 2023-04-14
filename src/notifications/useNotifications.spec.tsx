import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotificationsProvider } from "./NotificationProvider";
import { useNotifications } from "./useNotifications";

describe("useNotifications", () => {
	it("returns context value of NotificationsProvider", () => {
		const hook = renderHook(() => useNotifications(), {
			wrapper: ({ children }) => (
				<NotificationsProvider>{children}</NotificationsProvider>
			),
		});
		expect(hook.result.current.notifications).toBeDefined();
		expect(hook.result.current.queue).toBeDefined();
	});
});
