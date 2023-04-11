import { getTransitionStyles } from "./getTransitionStyles";
import { type TransitionMethod } from "./transitions";
import { useTransition } from "./useTransition";

export interface TransitionProps {
  /** Predefined transition name or transition styles */
  transition: TransitionMethod;

  /** Transition duration in ms */
  duration?: number;

  /** Exit transition duration in ms */
  exitDuration?: number;

  /** Transition timing function */
  timingFunction?: React.CSSProperties["transitionTimingFunction"];

  /** When true, component will be mounted */
  mounted: boolean;

  /** Render function with transition styles argument */
  children(styles: React.CSSProperties): React.ReactElement<any, any>;

  /** Calls when exit transition ends */
  onExited?: () => void;

  /** Calls when exit transition starts */
  onExit?: () => void;

  /** Calls when enter transition starts */
  onEnter?: () => void;

  /** Calls when enter transition ends */
  onEntered?: () => void;
}

export const Transition = ({
  transition,
  duration = 250,
  exitDuration = duration,
  mounted,
  children,
  timingFunction = "ease",
  onExit,
  onEntered,
  onEnter,
  onExited,
}: TransitionProps) => {
  const { transitionDuration, transitionStatus, transitionTimingFunction } =
    useTransition({
      mounted,
      exitDuration,
      duration,
      timingFunction,
      onExit,
      onEntered,
      onEnter,
      onExited,
    });

  if (transitionDuration === 0) {
    return mounted ? <>{children({})}</> : null;
  }

  return transitionStatus === "exited" ? null : (
    <>
      {children(
        getTransitionStyles({
          transition,
          duration: transitionDuration,
          state: transitionStatus,
          timingFunction: transitionTimingFunction,
        })
      )}
    </>
  );
};
