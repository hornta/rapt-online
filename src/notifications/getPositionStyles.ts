import { type CSSProperties } from "react";
import { type NotificationsProviderPositioning } from "./notificationTypes";

export function getPositionStyles(
  [vertical, horizontal]: NotificationsProviderPositioning,
  spacing: number
) {
  const styles: CSSProperties = {};

  vertical === "top" && (styles.top = spacing);
  vertical === "bottom" && (styles.bottom = spacing);

  horizontal === "left" && (styles.left = spacing);
  horizontal === "right" && (styles.right = spacing);
  horizontal === "center" &&
    ((styles.left = "50%"), (styles.transform = "translateX(-50%)"));

  return styles;
}
