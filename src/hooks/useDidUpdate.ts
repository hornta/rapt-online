import {
	type EffectCallback,
	type DependencyList,
	useRef,
	useEffect,
} from "react";

export function useDidUpdate(
	fn: EffectCallback,
	dependencies?: DependencyList
) {
	const mounted = useRef(false);

	useEffect(
		() => () => {
			mounted.current = false;
		},
		[]
	);

	useEffect(() => {
		if (mounted.current) {
			return fn();
		}

		mounted.current = true;
		return undefined;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);
}
