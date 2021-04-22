import {
	isArray,
	isEmpty,
	isEmptyArray,
	isFalsy,
	isFunction,
	isNotEmpty,
	isString,
	isTruthy,
} from "../../../src/utils/asserts";

test("isFalsy", () => {
	expect(isFalsy(false)).toEqual(true);
	expect(isFalsy(0)).toEqual(true);
	expect(isFalsy(undefined)).toEqual(true);
	expect(isFalsy(NaN)).toEqual(true);
	expect(isFalsy(null)).toEqual(true);
	expect(isFalsy("")).toEqual(true);
	expect(isFalsy(String())).toEqual(true);
});

test("isTruthy", () => {
	expect(isTruthy(true)).toEqual(true);
	expect(isTruthy(3)).toEqual(true);
	expect(isTruthy({})).toEqual(true);
	expect(isTruthy([])).toEqual(true);
	expect(isTruthy(new String())).toEqual(true);
});

test("isString", () => {
	expect(isString("")).toEqual(true);
	expect(isString(new String())).toEqual(true);
});

test("isFunction", () => {
	expect(isFunction(new Function())).toEqual(true);
	expect(isFunction(() => {})).toEqual(true);
	expect(isFunction(function () {})).toEqual(true);
});

test("isEmpty", () => {
	expect(isEmpty()).toEqual(true);
	expect(isEmpty(undefined)).toEqual(true);
});

test("isNotEmpty", () => {
	expect(isNotEmpty(undefined)).toEqual(false);
	expect(isNotEmpty({})).toEqual(true);
	expect(isNotEmpty([])).toEqual(true);
	expect(isNotEmpty("")).toEqual(true);
	expect(isNotEmpty(false)).toEqual(true);
	expect(isNotEmpty(true)).toEqual(true);
});

test("isArray", () => {
	expect(isArray([])).toEqual(true);
	expect(isArray(new Array())).toEqual(true);
	expect(isArray(Array())).toEqual(true);
	expect(isArray({ length: 3, 0: 3, 1: 4, 2: 5 })).toEqual(false);
});

test("isEmptyArray", () => {
	expect(isEmptyArray([])).toEqual(true);
	expect(isEmptyArray(new Array())).toEqual(true);
	expect(isEmptyArray(Array())).toEqual(true);
	expect(isEmptyArray({ length: 0 })).toEqual(false);
});
