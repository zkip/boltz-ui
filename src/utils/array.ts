import { Entities, pass } from "./constants";

export const repeatGenerator = (v: number) => pass(v);

// Array Generator
export const repeat = (count: number) => {
	return (fn = repeatGenerator) =>
		new Array(count).fill(0).map((_, i: number) => fn(i));
};

// export const joinWith =
// 	(...process: Function[]) =>
// 	(...strings: string[]) =>
// strings.join.bind(strings);

export const joinBySpace = (...cls: string[]) => cls.filter(Boolean).join(" ");

export const sum = (...numbers: number[]) => numbers.reduce((a, b) => a + b);

export const walk =
	(operation = (a = 0, b = 0) => a + b) =>
	(...arrays) => {
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

export const last = <T, K>(entity: Entities<T, K>) => Array.from(entity).pop();

export const first = <T, K>(entity: Entities<T, K>) =>
	entity.entries().next().value as [T, K];

export const lastKey = <T, K>(entity: Entities<T, K>) => last(entity)[0];
export const lastValue = <T, K>(entity: Entities<T, K>) => last(entity)[1];
export const firstKey = <T, K>(entity: Entities<T, K>) => first(entity)[0];
export const firstValue = <T, K>(entity: Entities<T, K>) => first(entity)[1];

export const inBound = (a: number, b: number) => (v: number) =>
	Math.max(Math.min(a, b), Math.min(v, Math.max(a, b)));

export const inArrayBound = <T>({ length }: ArrayLike<T>) =>
	inBound(0, length - 1);

const a = new Map<string,number>()
const b = new Set<boolean>();

first(a)