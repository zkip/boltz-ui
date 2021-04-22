import {
	add,
	walk,
	first,
	firstInIter,
	inArrayBound,
	inBound,
	joinBySpace,
	last,
	repeat,
} from "@/utils/array";

test("repeat", () => {
	expect(repeat(3)()).toEqual([0, 1, 2]);
	expect(repeat(3)((idx) => idx * 2)).toEqual([0, 2, 4]);
});

test("joinBySpace", () => {
	expect(joinBySpace("A", "B", "C")).toEqual("A B C");
	expect(joinBySpace("A", undefined, "C", undefined)).toEqual("A C");
});

test("add", () => {
	expect(add(4)).toEqual(4);
	expect(add(1, -3, 4)).toEqual(2);
	expect(add(1, 2, 3, 4)).toEqual(10);
});

test("walk", () => {
	expect(walk()([1, 23, 4])).toEqual([1, 23, 4]);
	expect(walk()([1, 23, 4], [0, -19, 5])).toEqual([1, 4, 9]);
	expect(walk()([1, 23, 4], new Array(6))).toEqual([1, 23, 4, 0, 0, 0]);
	expect(walk()([1, 2, 3], new Array(6), [1, 2, 3], [1, 2, 3])).toEqual([
		3,
		6,
		9,
		0,
		0,
		0,
	]);

	expect(
		walk((a = 0, b = 0) => a - b)([1, 2, 3], [4, -3], new Array(4))
	).toEqual([-3, 5, 3, 0]);

	expect(
		walk((a = 0, b = 0) => (a > b ? a : b))(
			[1, -2, 3],
			[4, -8],
			[-6, -14, 8, -3],
			new Array(4)
		)
	).toEqual([4, 0, 8, 0]);

	expect(
		walk((a = 1, b = 1) => a * b)(
			[1, -2, 3],
			[4, -8],
			[-6, 0, 8, -3],
			new Array(4)
		)
	).toEqual([-24, 0, 24, -3]);
	expect(walk()()).toEqual([]);
	expect(walk()([])).toEqual([]);
});

test("last", () => {
	expect(last([1, 2, 3])).toEqual(3);
	expect(last({ length: 4, 3: "gold" })).toEqual("gold");
});

test("first", () => {
	expect(first([1, 2, 3])).toEqual(1);
	expect(first({ 0: "gold" })).toEqual("gold");
});

test("inBound", () => {
	expect(inBound(0, 5)(3)).toEqual(3);
	expect(inBound(0, 5)(7)).toEqual(5);
	expect(inBound(-3, 5)(-6)).toEqual(-3);
	expect(inBound(5, 2)(-6)).toEqual(2);
	expect(inBound(5, 2)(6)).toEqual(5);
	expect(inBound(5, 5)(13)).toEqual(5);
	expect(inBound(5, 5)(-13)).toEqual(5);
});

test("inArrayBound", () => {
	expect(inArrayBound([8, 2, 3])(6)).toEqual(2);
	expect(inArrayBound(["x", undefined, 3])(0)).toEqual(0);
	expect(inArrayBound(new Array(10))(24)).toEqual(9);
	expect(inArrayBound({ length: 4 })(-5)).toEqual(0);
});

test("firstInIter", () => {
	{
		const set = new Set();
		set.add(4);
		expect(firstInIter(set)).toEqual([4, 4]);
	}
	{
		const set = new Set();
		const sym = Symbol();
		set.add(sym);
		expect(firstInIter(set)).toEqual([sym, sym]);
	}
	{
		const map = new Map();
		const sym = Symbol();
		map.set(sym, 3);
		expect(firstInIter(map)).toEqual([sym, 3]);
	}
});
