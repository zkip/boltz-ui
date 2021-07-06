let topObject = globalThis;

export const getTopObject = () => topObject;

export const setTopObject = (object) => {
	topObject = object;
};

export const EMPTY_STRING = new String();

export const noop = () => {};

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
	[Symbol.iterator](): IterableIterator<K>;
	entries(): IterableIterator<[T, K]>;
}
