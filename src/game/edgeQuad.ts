import { Edge } from "./edge";

export class EdgeQuad {
	edges: [Edge | null, Edge | null, Edge | null, Edge | null];
	quantities: [number, number, number, number];

	constructor() {
		this.nullifyEdges();
		this.quantities = [0, 0, 0, 0];
	}

	nullifyEdges() {
		this.edges = [null, null, null, null];
	}

	minimize(edge: Edge, quantity: number) {
		const orientation = edge.getOrientation();
		if (
			this.edges[orientation] === null ||
			quantity < this.quantities[orientation]
		) {
			this.edges[orientation] = edge;
			this.quantities[orientation] = quantity;
		}
	}

	throwOutIfGreaterThan(minimum: number) {
		for (let i = 0; i < 4; i++) {
			if (this.quantities[i] > minimum) {
				this.edges[i] = null;
			}
		}
	}
}

export const edgeQuad = new EdgeQuad();
