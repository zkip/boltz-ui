import { getTopObject } from "./variables";

export const listen = (name, target = getTopObject(), option) => (fn) => {
	target.addEventListener(name, fn, option);
	return function clean() {
		target.removeEventListener(name, fn, option);
	};
};

export const noop = () => {};

export const fallback = (default_value) => (v = default_value) => v;
