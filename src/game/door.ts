import { Cell } from "./cell";
import { DOORBELL_OPEN, DOORBELL_CLOSE, DOORBELL_TOGGLE } from "./constants";
import { Edge } from "./edge";
import { gameState } from "./game";

export class Door {
	cells: [Cell | null, Cell | null];
	edges: [Edge | null, Edge | null];

	constructor(
		edge0: Edge | null,
		edge1: Edge | null,
		cell0: Cell | null,
		cell1: Cell | null
	) {
		this.cells = [cell0, cell1];
		this.edges = [edge0, edge1];
	}

	doorExists(i: number) {
		const edge = this.edges[i];
		if (edge === null) {
			return false;
		}

		const cell = this.cells[i];

		return cell !== null && cell.getEdge(edge) !== -1;
	}

	doorPut(i: number, kill: boolean) {
		const edge = this.edges[i];
		if (edge !== null && !this.doorExists(i)) {
			const cell = this.cells[i];
			if (cell === null) {
				return;
			}

			cell.addEdge(new Edge(edge.getStart(), edge.getEnd(), edge.color));

			if (kill) {
				gameState.killAll(edge);
			}

			gameState.recordModification();
		}
	}

	doorRemove(i: number) {
		const edge = this.edges[i];
		if (edge !== null && this.doorExists(i)) {
			const cell = this.cells[i];
			if (cell === null) {
				return;
			}

			cell.removeEdge(edge);

			gameState.recordModification();
		}
	}

	act(behavior: 0 | 1 | 2, force: boolean, kill: boolean) {
		for (let i = 0; i < 2; ++i) {
			switch (behavior) {
				case DOORBELL_OPEN:
					this.doorRemove(i);
					break;
				case DOORBELL_CLOSE:
					this.doorPut(i, kill);
					break;
				case DOORBELL_TOGGLE:
					if (this.doorExists(i)) {
						this.doorRemove(i);
					} else {
						this.doorPut(i, kill);
					}
					break;
			}
		}
	}
}
