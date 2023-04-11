import { type CSSProperties, type ReactElement } from "react";
import { getTransitionStyles } from "./transitions/getTransitionStyles.js";
import { TransitionMethod } from "./transitions/transitions.js";
import { useTransition } from "./transitions/useTransition.js";

interface GroupedTransitionItem {
	duration: number;
	timingFunction?: CSSProperties["transitionTimingFunction"];
	transition: TransitionMethod;
}

export interface GroupedTransitionProps {
	/** Transitions group */
	transitions: Record<string, GroupedTransitionItem>;

	/** Render function with transition group styles argument */
	children(styles: Record<string, CSSProperties>): ReactElement<any, any>;

	/** Enter transition duration in ms */
	duration?: number;

	/** Exit transition duration in ms */
	exitDuration?: number;

	/** Transition timing function, defaults to theme.transitionTimingFunction */
	timingFunction?: React.CSSProperties["transitionTimingFunction"];

	/** When true, component will be mounted */
	mounted: boolean;

	/** Calls when exit transition ends */
	onExited?: () => void;

	/** Calls when exit transition starts */
	onExit?: () => void;

	/** Calls when enter transition starts */
	onEnter?: () => void;

	/** Calls when enter transition ends */
	onEntered?: () => void;
}

export function GroupedTransition({
	transitions,
	duration = 250,
	exitDuration = duration,
	mounted,
	children,
	timingFunction = "ease",
	onExit,
	onEntered,
	onEnter,
	onExited,
}: GroupedTransitionProps) {
	const { transitionDuration, transitionStatus, transitionTimingFunction } =
		useTransition({
			mounted,
			duration,
			exitDuration,
			timingFunction,
			onExit,
			onEntered,
			onEnter,
			onExited,
		});

	if (transitionDuration === 0) {
		return mounted ? <>{children({})}</> : null;
	}

	if (transitionStatus === "exited") {
		return null;
	}

	const transitionsStyles = Object.keys(transitions).reduce<
		Record<string, React.CSSProperties>
	>((acc, transition) => {
		acc[transition] = getTransitionStyles({
			duration: transitions[transition].duration,
			transition: transitions[transition].transition,
			timingFunction:
				transitions[transition].timingFunction ?? transitionTimingFunction,
			state: transitionStatus,
		});

		return acc;
	}, {});

	return <>{children(transitionsStyles)}</>;
}

GroupedTransition.displayName = "GroupedTransition";
