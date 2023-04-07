export function lerp(a: number, b: number, percent: number) {
	return a + (b - a) * percent;
}

export function randInRange(a: number, b: number) {
	return lerp(a, b, Math.random());
}
