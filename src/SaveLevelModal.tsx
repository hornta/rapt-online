import { useId } from "react";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { Label } from "./components/Label";
import {
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
} from "./components/Modal";
import { Textarea } from "./components/Textarea";
import { CheckboxField } from "./components/checkbox/CheckboxField";
import { useForm } from "react-hook-form";

interface Inputs {
	name: string;
	description: string;
	one_player: boolean;
	two_players: boolean;
}

interface SaveLevelModalProps {
	open: boolean;
	onClose: () => void;
}

export const SaveLevelModal = ({ onClose, open }: SaveLevelModalProps) => {
	const formId = useId();

	const form = useForm<Inputs>({
		defaultValues: {
			description: "",
			name: "",
			one_player: false,
			two_players: true,
		},
	});

	// const [publishLevel] = usePublishLevelMutation();

	return (
		<Modal open={open} onClose={onClose}>
			<ModalTitle title="Save level"></ModalTitle>
			<ModalContent>
				<form
					id={formId}
					onSubmit={form.handleSubmit(async (data) => {
						// const result = await publishLevel({
						// 	description: data.description,
						// 	name: data.name,
						// 	one_player: data.one_player,
						// 	two_players: data.two_players,
						// });
					})}
				>
					<Label>Name</Label>
					<Input containerProps={{ className: "mb-4" }} />
					<Label>Description</Label>
					<Textarea className="mb-4" />

					<CheckboxField label="1 player"></CheckboxField>
					<CheckboxField label="2 players"></CheckboxField>
				</form>
			</ModalContent>
			<ModalActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={() => {}} variant="primary" form={formId}>
					Save
				</Button>
			</ModalActions>
		</Modal>
	);
};
