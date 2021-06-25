import { entries } from "@/utils/object";

export function ep(fn: Function) {
	return (dom: HTMLElement, params?: any) => {
		const name_map = new Map(); // Function : EventName
		const listeners = fn(free, reup);
		const listeners_processing = new Set();

		entries(listeners)(([name, listener]) => name_map.set(listener, name));

		function free(sign, args) {
			if (listeners_processing.has(sign)) {
				const name = name_map.get(sign);
				dom.removeEventListener(name, sign, args);
				listeners_processing.delete(sign);
			}
		}
		function reup(sign, args) {
			if (!listeners_processing.has(sign)) {
				const name = name_map.get(sign);
				dom.addEventListener(
					name,
					(e) => {
						trigger();
						sign(e);
					},
					args
				);
				listeners_processing.add(sign);
			}
		}

		return {
			destroy() {},
		};
	};
}

export function trigger() {}
