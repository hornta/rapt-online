const prefix = "Invariant failed";

// https://github.com/alexreardon/tiny-invariant

export function invariant(
	condition: any,
	message?: string | (() => string)
): asserts condition {
	if (condition) {
		return;
	}

	if (process.env.NODE_ENV === "development") {
		throw new Error(prefix);
	}

	const provided: string | undefined =
		typeof message === "function" ? message() : message;

	const value: string = provided ? `${prefix}: ${provided}` : prefix;
	throw new Error(value);
}
