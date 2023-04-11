export interface GetSize {
	size: string | number;
	sizes: Record<string, any>;
}

export function getSize(props: GetSize) {
	if (typeof props.size === "number") {
		return props.size;
	}

	const computedSize = props.sizes[props.size];

	return computedSize !== undefined
		? computedSize
		: props.size || props.sizes.md;
}
