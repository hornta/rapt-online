import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { clsx } from "clsx";
import {
	FloatingFocusManager,
	FloatingNode,
	FloatingOverlay,
	FloatingPortal,
	useDismiss,
	useFloating,
	useFloatingNodeId,
	useInteractions,
} from "@floating-ui/react";
import { Button } from "./Button.js";
import { GroupedTransition } from "./GroupedTransition.js";
import { getSize } from "../utils/getSize.js";

const sizes = {
	xs: 320,
	sm: 380,
	md: 440,
	lg: 620,
	xl: 780,
};

export interface ModalProps {
	children?: ReactNode;
	open: boolean;
	onClose: () => void;
	size?: string | number;
}

export const Modal = ({ children, open, onClose, size = "md" }: ModalProps) => {
	const nodeId = useFloatingNodeId();
	const { floating, context } = useFloating({
		open,
		onOpenChange: (open) => {
			if (!open) {
				onClose();
			}
		},
		nodeId,
	});

	const { getFloatingProps } = useInteractions([
		useDismiss(context, { bubbles: false, outsidePress: false }),
	]);

	return (
		<FloatingNode id={nodeId}>
			<FloatingPortal>
				<GroupedTransition
					mounted={open}
					transitions={{
						modal: {
							duration: 250,
							transition: "pop",
						},
						overlay: {
							duration: 250 / 2,
							transition: "fade",
							timingFunction: "ease",
						},
					}}
				>
					{(transitionStyles) => (
						<div className="fixed inset-0 z-[1210]">
							<FloatingOverlay lockScroll style={transitionStyles.overlay}>
								<div className="fixed bg-black inset-0 opacity-75" />
							</FloatingOverlay>
							<FloatingFocusManager context={context}>
								<div
									role="dialog"
									className="absolute inset-0 overflow-y-auto p-0 flex items-center justify-center"
									aria-labelledby="modal-title"
								>
									<div
										className="flex flex-col bg-white min-w-[400px] rounded-xl max-h-full overflow-auto z-10 max-h-[calc(100vh_-_40px]"
										{...getFloatingProps({
											ref: floating,
											style: {
												width: getSize({ size: size!, sizes }),
												...transitionStyles.modal,
											},
										})}
									>
										{children}
									</div>
								</div>
								{/* </FocusTrap> */}
							</FloatingFocusManager>
						</div>
					)}
				</GroupedTransition>
			</FloatingPortal>
		</FloatingNode>
	);
};

export interface ModalTitleProps extends ComponentPropsWithoutRef<"div"> {
	title: string;
	description?: string;
}

export const ModalTitle = ({
	title,
	description,
	className,
	...props
}: ModalTitleProps) => {
	return (
		<div className={clsx("p-6", className)} {...props}>
			<h2 className="text-lg font-medium" id="modal-title">
				{title}
			</h2>
			{description && (
				<div className="text-sm text-gray-500 mt-2">{description}</div>
			)}
		</div>
	);
};

export const ModalContent = ({
	children,
	className,
}: ComponentPropsWithoutRef<"div">) => {
	return (
		<div className={clsx("overflow-y-auto p-6 pt-0", className)}>
			{children}
		</div>
	);
};

export const ModalActions = ({ children }: ComponentPropsWithoutRef<"div">) => {
	return (
		<div className={clsx("flex justify-end p-6 pt-0", "space-x-2")}>
			{children}
		</div>
	);
};

export type ConfirmModalProps = ModalProps & {
	onConfirm(): void;
	title: string;
	description?: string;
	confirmButtonLabel: string;
	isLoading?: boolean;
	destructive?: boolean;
};

export const ConfirmModal = ({
	onConfirm,
	confirmButtonLabel,
	onClose,
	open,
	title,
	description,
	destructive = false,
	isLoading = false,
}: ConfirmModalProps) => {
	return (
		<Modal open={open} onClose={onClose}>
			<ModalTitle title={title} description={description} />
			<ModalActions>
				<Button onClick={onClose} variant="secondary">
					Cancel
				</Button>
				<Button
					destructive={destructive}
					onClick={onConfirm}
					isLoading={isLoading}
					disabled={isLoading}
				>
					{confirmButtonLabel}
				</Button>
			</ModalActions>
		</Modal>
	);
};
