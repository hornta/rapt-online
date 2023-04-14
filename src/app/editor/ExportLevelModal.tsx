import {
	showErrorNotification,
	showSuccessNotification,
} from "@/notifications/events";
import { Button } from "../../components/Button";
import {
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
} from "../../components/Modal";
import { Textarea } from "../../components/Textarea";
import { LevelData } from "@/schemas";

interface ExportLevelModalProps {
	open: boolean;
	onClose: () => void;
	levelData: LevelData | null;
}

export const ExportLevelModal = ({
	onClose,
	open,
	levelData,
}: ExportLevelModalProps) => {
	return (
		<Modal open={open} onClose={onClose}>
			<ModalTitle title="Save level"></ModalTitle>
			<ModalContent>
				<Textarea defaultValue={JSON.stringify(levelData)} readOnly></Textarea>
			</ModalContent>
			<ModalActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={() => {
						try {
							navigator.clipboard.writeText(JSON.stringify(levelData));
							showSuccessNotification({
								message: "Copied!",
							});
							onClose();
						} catch {
							showErrorNotification({
								message: "Failed to copy",
							});
						}
					}}
					variant="primary"
				>
					Copy
				</Button>
			</ModalActions>
		</Modal>
	);
};
