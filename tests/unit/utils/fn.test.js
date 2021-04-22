import { fallback, listen, noop } from "../../../src/utils/fn";
import { setTopObject } from "../../../src/utils/variables";

function DOMEventTarget(onAdd, onRemove) {
	return {
		addEventListener: onAdd,
		removeEventListener: onRemove,
	};
}

test("listen", () => {
	{
		const mousedown = () => {};
		const clean = listen(
			"mousedown",
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
			),
			{
				passive: false,
			}
		)(mousedown);

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

					rv();
				}
			)
		);
		let clean = listen("mousedown")(mousedown);
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
