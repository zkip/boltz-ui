// Array Generator
export const repeat = (count) => {
	return (fn = (v) => v) => new Array(count).fill(0).map((_, i) => fn(i));
};

export const joinBySpace = (...cls) => cls.filter(Boolean).join(" ");

export const add = (...nums) => nums.reduce((a, b) => a + b);

export const walk = (operation = (a = 0, b = 0) => a + b) => (...arrays) => {
	if (arrays.length < 1) return [];

	let capacity = arrays[0].length;
	const result = new Array(capacity);
	let is_probed = false;

	for (let p = 0; p < capacity; p++) {
		let sum = arrays[0][p];

		for (let i = 1; i < arrays.length; i++) {
			const array = arrays[i];
			const width = array.length;
			sum = operation(sum, array[p]);

			if (!is_probed) {
				capacity = Math.max(capacity, width);
			}
		}

		result[p] = sum;

		is_probed = true;
	}

	return result;
};

export const last = (arraylike) => arraylike[arraylike.length - 1];

export const first = (arraylike) => arraylike[0];

export const inBound = (a, b) => (v) =>
	Math.max(Math.min(a, b), Math.min(v, Math.max(a, b)));

export const inArrayBound = ({ length }) => inBound(0, length - 1);

export const firstInIter = (iterable) => iterable.entries().next().value;
