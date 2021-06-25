import { fallback, listen, noop } from "@/utils/fn";
import { DOMEventType, setTopObject } from "@/utils/constants";

function DOMEventTarget(
	onAdd: (name, fn, option) => void,
	onRemove: (name, fn, option) => void
) {
	return {
		addEventListener: onAdd,
		removeEventListener: onRemove,
	} as EventTarget;
}

test("listen", () => {
	{
		const mousedown = () => {};
		const clean = listen(
			DOMEventTarget(
				(name, fn, option) => {
					expect(name).toEqual("mousedown");
					expect(fn).toEqual(mousedown);
					expect(option).toEqual({ passive: false });
				},
				(name, fn, option) => {
					expect(name).toEqual("mousedown");
					expect(fn).toEqual(mousedown);
					expect(option).toEqual({ passive: false });
				}
			)
		).on("mousedown", { passive: false })(mousedown);

		clean();
	}

	return new Promise((rv) => {
		const mousedown = () => {};
		setTopObject(
			DOMEventTarget(
				(name, fn, option) => {
					expect(name).toEqual("mousedown");
					expect(fn).toEqual(mousedown);
					expect(option).toEqual(undefined);
				},
				(name, fn, option) => {
					expect(name).toEqual("mousedown");
					expect(fn).toEqual(mousedown);
					expect(option).toEqual(undefined);

					rv(undefined);
				}
			)
		);
		const clean = listen().on("mousedown")(mousedown);
		clean();
	});
});

test("noop", () => {
	expect(noop()).toEqual(undefined);
});

test("fallback", () => {
	expect(fallback(5)(undefined)).toEqual(5);
	expect(fallback(undefined)()).toEqual(undefined);
	expect(fallback(5)(false)).toEqual(false);
	expect(fallback(5)("")).toEqual("");
});
