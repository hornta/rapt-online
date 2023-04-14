////////////////////////////////////////////////////////////////////////////////
// class Document
////////////////////////////////////////////////////////////////////////////////

import { UndoStack } from "./undoStack";
import { Button } from "./placeables/button";
import { World } from "./world";
import { Link } from "./placeables/link";
import { SetCellCommand } from "./commands/setCellCommand";
import { SetSelectionCommand } from "./commands/setSelectionCommand";
import { BasePlaceable } from "./placeables/placeable";
import { AddPlaceableCommand } from "./commands/addPlaceableCommand";
import { MacroCommand } from "./commands/macroCommand";
import { MoveSelectionCommand } from "./commands/moveSelectionCommand";
import { RemovePlaceableCommand } from "./commands/removePlaceableCommand";
import { RotateSelectionCommand } from "./commands/rotateSelectionCommand";
import { SetPlayerGoalCommand } from "./commands/setPlayerGoalCommand";
import { SetPlayerStartCommand } from "./commands/setPlayerStartCommand";
import { SetSignTextCommand } from "./commands/setSignTextCommand";
import { ToggleInitiallyOpenCommand } from "./commands/toggleInitiallyOpenCommand";
import { Door } from "./placeables/door";
import { Vector } from "../vector";
import { Sprite } from "./placeables/sprite";
import { ClearCommand } from "./commands/clearCommand";

export class Document {
	undoStack: UndoStack;
	world: World;

	constructor() {
		this.world = new World();
		this.undoStack = new UndoStack();
	}

	setCell(x: number, y: number, type: 0 | 2 | 1 | 3 | 4 | 5) {
		this.undoStack.push(new SetCellCommand(this.world, x, y, type));
	}

	addPlaceable(placeable: BasePlaceable) {
		this.undoStack.push(new AddPlaceableCommand(this.world, placeable));
	}

	removePlaceable(placeable: BasePlaceable) {
		this.undoStack.push(new RemovePlaceableCommand(this.world, placeable));

		// Also remove all links with deleted buttons and doors
		if (placeable instanceof Button || placeable instanceof Door) {
			const deadLinks = [];
			let i;
			for (i = 0; i < this.world.placeables.length; i++) {
				const link = this.world.placeables[i];
				if (
					link instanceof Link &&
					(link.button === placeable || link.door === placeable)
				) {
					deadLinks.push(link);
				}
			}
			for (i = 0; i < deadLinks.length; i++) {
				this.undoStack.push(
					new RemovePlaceableCommand(this.world, deadLinks[i])
				);
			}
		}
	}

	setSelection(selection: BasePlaceable[]) {
		// Compare oldSelection and selection
		const oldSelection = this.world.getSelection();
		let sameSelection = oldSelection.length === selection.length;
		if (sameSelection) {
			for (let i = 0; i < oldSelection.length; i++) {
				let found = false;
				for (let j = 0; j < selection.length; j++) {
					if (oldSelection[i] === selection[j]) {
						found = true;
						break;
					}
				}
				if (found === false) {
					sameSelection = false;
					break;
				}
			}
		}

		// Only change the selection if oldSelection and selection are different
		if (!sameSelection) {
			this.undoStack.push(new SetSelectionCommand(this.world, selection));
		}
	}

	moveSelection(delta: Vector) {
		this.undoStack.push(new MoveSelectionCommand(this.world, delta));
	}

	rotateSelection(deltaAngle: number) {
		this.undoStack.push(new RotateSelectionCommand(this.world, deltaAngle));
	}

	setPlayerStart(playerStart: Vector) {
		this.undoStack.push(new SetPlayerStartCommand(this.world, playerStart));
	}

	setPlayerGoal(playerGoal: Vector) {
		this.undoStack.push(new SetPlayerGoalCommand(this.world, playerGoal));
	}

	toggleInitiallyOpen(door: Door) {
		this.undoStack.push(new ToggleInitiallyOpenCommand(door));
	}

	setSignText(sign: Sprite, text: string) {
		this.undoStack.push(new SetSignTextCommand(sign, text));
	}

	clear() {
		this.undoStack.push(new ClearCommand(this.world));
	}

	isClean() {
		let index = this.undoStack.currentIndex;
		const clean = this.undoStack.cleanIndex;

		// back up to ignore all selection commands, because changing the selection shouldn't count as a modification
		while (index > clean) {
			const c = this.undoStack.commands[index - 1];
			if (
				c instanceof SetSelectionCommand ||
				(c instanceof MacroCommand &&
					c.commands.length === 1 &&
					c.commands[0] instanceof SetSelectionCommand)
			) {
				index--;
			} else {
				break;
			}
		}

		return index === clean;
	}
}
