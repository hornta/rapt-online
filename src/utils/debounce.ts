export const debounce = (
	func: (...args: any[]) => void,
	wait: number,
	immediate = false
) => {
	let timeout: NodeJS.Timeout | undefined;

	return (...args: any[]) => {
		const later = function () {
			timeout = undefined;
			if (!immediate) {
				func(...args);
			}
		};

		const callNow = immediate && !timeout;

		clearTimeout(timeout);

		timeout = setTimeout(later, wait);

		if (callNow) {
			func(...args);
		}
	};
};
