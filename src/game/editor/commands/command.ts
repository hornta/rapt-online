export abstract class Command {
	abstract undo(): void;
	abstract redo(): void;
	abstract mergeWith(command: Command): boolean;
}
