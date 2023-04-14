import { useId } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Label } from "../../components/Label";
import {
	Modal,
	ModalTitle,
	ModalContent,
	ModalActions,
} from "../../components/Modal";
import { Textarea } from "../../components/Textarea";
import { CheckboxField } from "../../components/checkbox/CheckboxField";
import { useForm } from "react-hook-form";
import { usePublishLevelMutation } from "../../api";
import { Hint } from "../../components/Hint";

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

	const [publishLevel] = usePublishLevelMutation();

	return (
		<Modal open={open} onClose={onClose}>
			<ModalTitle title="Save level"></ModalTitle>
			<ModalContent>
				<form
					id={formId}
					onSubmit={form.handleSubmit(async (data) => {
						await publishLevel({
							description: data.description,
							name: data.name,
							one_player: data.one_player,
							two_players: data.two_players,
						});
					})}
				>
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						{...form.register("name", { required: "This is a required field" })}
						containerProps={{ className: "mb-4" }}
						aria-invalid={form.formState.errors.name !== undefined}
						hint={form.formState.errors.name?.message}
					/>
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						{...form.register("description", {
							required: "This is a required field",
						})}
						containerProps={{ className: "mb-4" }}
						aria-invalid={form.formState.errors.description !== undefined}
						hint={form.formState.errors.description?.message}
					/>

					<div>
						<CheckboxField
							{...form.register("one_player", {
								onChange() {
									form.trigger("two_players");
								},
							})}
							label="1 player"
						></CheckboxField>
					</div>
					<div>
						<CheckboxField
							{...form.register("two_players", {
								validate: (value, formValues) => {
									if (
										formValues.one_player === false &&
										formValues.two_players === false
									) {
										return "Select at least one option";
									}
								},
							})}
							label="2 players"
						></CheckboxField>
						{form.formState.errors.two_players !== undefined && (
							<Hint error>{form.formState.errors.two_players.message}</Hint>
						)}
					</div>
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
