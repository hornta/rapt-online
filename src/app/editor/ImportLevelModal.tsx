import { Button } from "../../components/Button";
import {
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
} from "../../components/Modal";
import { Textarea } from "../../components/Textarea";
import { LevelData, levelDataSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { useId } from "react";
import { Label } from "@/components/Label";
import { showSuccessNotification } from "@/notifications/events";

interface Inputs {
	json: string;
}

interface ImportLevelModalProps {
	open: boolean;
	onClose: () => void;
	onImport: (levelData: LevelData) => void;
}

export const ImportLevelModal = ({
	onClose,
	open,
	onImport,
}: ImportLevelModalProps) => {
	const form = useForm<Inputs>({
		defaultValues: { json: "" },
		mode: "onChange",
	});

	const formId = useId();

	const handleClose = () => {
		form.reset({ json: "" });
		onClose();
	};

	return (
		<Modal open={open} onClose={handleClose}>
			<ModalTitle title="Import level"></ModalTitle>
			<ModalContent>
				<form
					id={formId}
					onSubmit={form.handleSubmit((data) => {
						onImport(levelDataSchema.parse(JSON.parse(data.json)));
						handleClose();
						showSuccessNotification({
							message: "Level was imported successfully",
						});
					})}
				>
					<Label htmlFor="level_data">Level data</Label>
					<Textarea
						id="level_data"
						{...form.register("json", {
							validate: (json) => {
								try {
									levelDataSchema.parse(JSON.parse(json));
								} catch (e) {
									return "Invalid level data: \n" + e;
								}
							},
						})}
						aria-invalid={form.formState.errors.json !== undefined}
						hint={form.formState.errors.json?.message}
					></Textarea>
				</form>
			</ModalContent>
			<ModalActions>
				<Button onClick={handleClose}>Cancel</Button>
				<Button
					form={formId}
					variant="primary"
					disabled={!form.formState.dirtyFields}
				>
					Import
				</Button>
			</ModalActions>
		</Modal>
	);
};
