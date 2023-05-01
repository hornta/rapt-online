import {
	autoUpdate,
	flip,
	type FloatingContext,
	FloatingFocusManager,
	FloatingNode,
	FloatingPortal,
	offset as floatingUiOffset,
	type Placement,
	type ReferenceType,
	shift,
	size,
	useClick,
	useDismiss,
	useFloating,
	useFloatingNodeId,
	useId,
	useInteractions,
	useRole,
	useMergeRefs,
} from "@floating-ui/react";
import { clsx } from "clsx";
import {
	cloneElement,
	type CSSProperties,
	type ReactNode,
	useRef,
	type Ref,
	HTMLProps,
} from "react";
import { Transition } from "./transitions/Transition";
import { TransitionMethod } from "./transitions/transitions";

interface PopoverProps<T extends HTMLElement> {
	render: (data: {
		close: () => void;
		labelId: string;
		descriptionId: string;
		context: FloatingContext<ReferenceType>;
		initialFocusRef: Ref<T>;
		getFloatingProps: (
			props: { className?: string } & Record<string, unknown>
		) => Record<string, unknown>;
	}) => ReactNode;
	placement?: Placement;
	children: JSX.Element;
	className?: string;
	styles?: CSSProperties;
	open: boolean;
	onChangeOpen?: (open: boolean) => void;
	transition?: TransitionMethod;
	transitionDuration?: number;
	transitionTimingFunction?: CSSProperties["transitionTimingFunction"];

	/**
	 * `true` if the popover should be as wide as the reference element.
	 *
	 * @default false
	 */
	matchReferenceWidth?: boolean;
	zIndex?: CSSProperties["zIndex"];
	offset?: number;
	withFocusManager?: boolean;
	maxHeight?: number;

	/**
	 * If `true` then the element rendered in the `children` will be the floating element and
	 * `getFloatingProps` will have to be spread onto it. If `false` then `<Popover>` wraps whatever you
	 * render in children in a floating div element.
	 *
	 * Defaults to `false`
	 */
	noWrappingFloating?: boolean;

	/**
	 * Control if escape closes the popover.
	 *
	 * Defaults to `true`
	 */
	closeOnEscape?: boolean;
}

export const Popover = <T extends HTMLElement>({
	children,
	render,
	placement,
	className,
	open,
	onChangeOpen,
	transition = "pop",
	transitionDuration = 250,
	transitionTimingFunction = "ease",
	matchReferenceWidth = false,
	zIndex,
	offset,
	styles,
	withFocusManager = true,
	maxHeight,
	noWrappingFloating,
	closeOnEscape = true,
}: PopoverProps<T>) => {
	const nodeId = useFloatingNodeId();
	const { x, y, strategy, context, refs } = useFloating({
		open,
		onOpenChange: onChangeOpen,
		middleware: [
			floatingUiOffset(offset ?? 8),
			flip(),
			shift({ padding: 10 }),
			size({
				apply({ rects, availableHeight }) {
					const styles: CSSProperties = {};
					if (maxHeight) {
						styles.maxHeight = `${
							availableHeight < maxHeight ? availableHeight : maxHeight
						}px`;
					} else {
						styles.maxHeight = `${maxHeight ?? availableHeight}px`;
					}

					if (matchReferenceWidth) {
						styles.width = `${rects.reference.width}px`;
					}

					Object.assign(refs.floating.current?.style ?? {}, styles);
				},
			}),
		],
		placement,
		whileElementsMounted: autoUpdate,
		nodeId,
	});

	const id = useId();
	const labelId = `${id}-label`;
	const descriptionId = `${id}-description`;

	const { getReferenceProps, getFloatingProps } = useInteractions([
		useClick(context, { keyboardHandlers: false }),
		useRole(context),
		useDismiss(context, {
			escapeKey: closeOnEscape,
			outsidePress(event) {
				// a probably better solution to this is to use the API from floating-ui
				// https://github.com/floating-ui/floating-ui/pull/1983
				if (event.target instanceof Element) {
					return !event.target.closest(".is-exopen-toast");
				}
				return true;
			},
		}),
	]);

	// Preserve the consumer's ref
	const ref = useMergeRefs([refs.setReference, (children as any).ref]);

	const initialFocusRef = useRef<T | null>(null);

	return (
		<FloatingNode id={nodeId}>
			{cloneElement(children, getReferenceProps({ ref, ...children.props }))}
			<FloatingPortal>
				<Transition
					transition={transition}
					duration={transitionDuration}
					timingFunction={transitionTimingFunction}
					mounted={open}
				>
					{(transitionStyles) => {
						const userProps: HTMLProps<HTMLElement> = {
							"aria-labelledby": labelId,
							"aria-describedby": descriptionId,
							className,
							style: {
								position: strategy,
								top: y ?? 0,
								left: x ?? 0,
								zIndex: zIndex ?? 1400,
								...transitionStyles,
								...styles,
							},
							ref: refs.setFloating,
						};

						const inner = render({
							labelId,
							descriptionId,
							close: () => {
								onChangeOpen?.(false);
							},
							context,
							initialFocusRef,
							getFloatingProps: ({ className, ...overrideProps }) => {
								const { className: userPropsClassName, ...restUserProps } =
									userProps;
								return getFloatingProps({
									className: clsx(userPropsClassName, className),
									...restUserProps,
									...overrideProps,
								});
							},
						});
						const floatingContent = noWrappingFloating ? (
							<>{inner}</>
						) : (
							<div {...getFloatingProps(userProps)}>{inner}</div>
						);

						if (withFocusManager) {
							return (
								<FloatingFocusManager
									context={context}
									initialFocus={initialFocusRef}
								>
									{floatingContent}
								</FloatingFocusManager>
							);
						}
						return floatingContent;
					}}
				</Transition>
			</FloatingPortal>
		</FloatingNode>
	);
};
