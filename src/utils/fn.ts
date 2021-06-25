import { DOMEventType, getTopObject } from "./constants";

export function listen(target: EventTarget = getTopObject()) {
	return {
		on(type: DOMEventType, option?: AddEventListenerOptions) {
			return (fn: EventListener) => {
				target.addEventListener(type, fn, option);
				return () => target.removeEventListener(type, fn, option);
			};
		},
	};
}

export const noop = () => {};

export const fallback =
	<T, K>(value: T) =>
	(v: T | K = value) =>
		v;
