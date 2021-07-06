import { isNotFound } from "@/utils/constants";
import { IndexTracker } from "@/utils/indices/indexTracker";

const A = {};
const B = {};
const C = {};
const D = {};
const E = {};
const F = {};
const G = {};

test("indexTracker: insert & get", () => {
	const idxTracker = new IndexTracker<{}>();
	const source = [A, B, C];

	source.map(idxTracker.insert.bind(idxTracker));

	source.splice(1, 0, D);
	idxTracker.insert(D, 1);

	expect(idxTracker.get(D)).toEqual(1);
	expect(idxTracker.get(B)).toEqual(2);
	expect(idxTracker.get(A)).toEqual(0);
	expect(idxTracker.get(C)).toEqual(3);
});

test("indexTracker: insert & remove & get", () => {
	const idxTracker = new IndexTracker<{}>();
	const source = [A, B, C];

	source.map(idxTracker.insert.bind(idxTracker));

	source.splice(1, 0, D);
	idxTracker.insert(D, 1);

	source.push(E);
	idxTracker.insert(E, source.length - 1);

	source.splice(2, 0, F);
	idxTracker.insert(F, 2);

	source.splice(0, 0, F);
	idxTracker.insert(G, 0);

	const C_index = idxTracker.get(C);
	if (!isNotFound(C_index)) {
		source.splice(C_index, 1);
		idxTracker.remove(C);
	}

	const E_index = idxTracker.get(E);
	if (!isNotFound(E_index)) {
		source.splice(E_index, 1);
		idxTracker.remove(E);
	}

	expect(isNotFound(C_index)).toEqual(false);
	expect(isNotFound(E_index)).toEqual(false);
	expect(isNotFound(idxTracker.get(C))).toEqual(true);
	expect(isNotFound(idxTracker.get(E))).toEqual(true);

	const A_index = idxTracker.get(A);
	const B_index = idxTracker.get(B);
	const D_index = idxTracker.get(D);
	const F_index = idxTracker.get(F);
	const G_index = idxTracker.get(G);

	if (
		!isNotFound(A_index) &&
		!isNotFound(B_index) &&
		!isNotFound(D_index) &&
		!isNotFound(F_index) &&
		!isNotFound(G_index)
	) {
		expect(source[A_index]).toEqual(A);
		expect(source[B_index]).toEqual(B);
		expect(source[D_index]).toEqual(D);
		expect(source[F_index]).toEqual(F);
		expect(source[G_index]).toEqual(G);
	} else {
		throw new Error("fail");
	}
});

test("indexTracker: edge cases", () => {
	const idxTracker = new IndexTracker<{}>();
	const source = [A, B, C];
	source.map(idxTracker.insert.bind(idxTracker));

	idxTracker.insert(A, 2);
	idxTracker.remove(E);
	idxTracker.get(F);

	expect(idxTracker.get(A)).toEqual(0);
	expect(idxTracker.get(B)).toEqual(1);
	expect(idxTracker.get(C)).toEqual(2);
});
