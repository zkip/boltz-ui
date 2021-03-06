let topObject = globalThis;

export const getTopObject = () => topObject;

export const setTopObject = (object: typeof globalThis) => {
	topObject = object;
};

export const EMPTY_STRING = new String();

export const noop = () => {};

export const isNoop = (v: any): v is typeof noop => v === noop;

export type NotFound = undefined;

export const isNotFound = (v: any): v is NotFound => v === undefined;

export type DOMEventType = string;

export type HTTPMethod =
	| "GET"
	| "HEAD"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS"
	| "TRACE"
	| "PATCH";

export type URLString = string;

export const pass = <T>(v: T) => v;

export interface Entities<T, K> {
	[Symbol.iterator](): IterableIterator<K | [T, K]>;
	entries(): IterableIterator<[T, K]>;
}

export type Bound = [min: number, max: number];
