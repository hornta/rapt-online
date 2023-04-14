import { useState, useEffect, useRef } from "react";
import { useDidUpdate } from "../../utils/useDidUpdate";

export type TransitionStatus =
	| "entered"
	| "exited"
	| "entering"
	| "exiting"
	| "pre-exiting"
	| "pre-entering";

export interface UseTransitionOptions {
	duration: number;
	exitDuration: number;
	timingFunction: string;
	mounted: boolean;
	onEnter?: () => void;
	onExit?: () => void;
	onEntered?: () => void;
	onExited?: () => void;
}

export const useTransition = ({
	duration,
	exitDuration,
	timingFunction,
	mounted,
	onEnter,
	onExit,
	onEntered,
	onExited,
}: UseTransitionOptions) => {
	const [transitionStatus, setStatus] = useState<TransitionStatus>(
		mounted ? "entered" : "exited"
	);
	let transitionDuration = duration;
	const timeoutRef = useRef<number>(-1);

	const handleStateChange = (shouldMount: boolean) => {
		let isCanceled = false;
		const preHandler = shouldMount ? onEnter : onExit;
		const handler = shouldMount ? onEntered : onExited;

		setStatus(shouldMount ? "pre-entering" : "pre-exiting");
		window.clearTimeout(timeoutRef.current);
		transitionDuration = shouldMount ? duration : exitDuration;

		if (transitionDuration === 0) {
			typeof preHandler === "function" && preHandler();
			typeof handler === "function" && handler();
			setStatus(shouldMount ? "entered" : "exited");
		} else {
			const preStateTimeout = window.setTimeout(() => {
				typeof preHandler === "function" && preHandler();

				if (!isCanceled) {
					setStatus(shouldMount ? "entering" : "exiting");
				}
			}, 10);

			timeoutRef.current = window.setTimeout(() => {
				window.clearTimeout(preStateTimeout);
				typeof handler === "function" && handler();
				if (!isCanceled) {
					setStatus(shouldMount ? "entered" : "exited");
				}
			}, transitionDuration);
		}

		return () => {
			isCanceled = true;
		};
	};

	useDidUpdate(() => {
		return handleStateChange(mounted);
	}, [mounted]);

	useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

	return {
		transitionDuration,
		transitionStatus,
		transitionTimingFunction: timingFunction,
	};
};
