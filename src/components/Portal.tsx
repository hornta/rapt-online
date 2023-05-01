import { useEffect, useState, type ReactNode, useRef } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
	children: ReactNode;
	target?: HTMLElement | string;
	className?: string;
}

export const Portal = ({ children, target, className }: PortalProps) => {
	const [mounted, setMounted] = useState(false);
	const ref = useRef<HTMLElement | null>(null);

	useEffect(() => {
		setMounted(true);
		ref.current = !target
			? document.createElement("div")
			: typeof target === "string"
			? document.querySelector(target)
			: target;

		if (!target) {
			document.body.appendChild(ref.current!);
		}

		return () => {
			if (!ref.current?.isConnected) {
				return;
			}
			!target && document.body.removeChild(ref.current!);
		};
	}, [target]);

	if (!mounted) {
		return null;
	}

	return createPortal(
		<div className={className}>{children}</div>,
		ref.current!
	);
};
