import { deleteKeys, entries, merge } from "../../../src/utils/object";

test("entries", () => {
	{
		const sym = Symbol();
		const probe = jest.fn();
		entries({ key: "value", sym })(probe);
		expect(probe).toHaveBeenCalledTimes(2);
		expect(probe).toHaveBeenNthCalledWith(1, "key", "value", 0);
		expect(probe).toHaveBeenNthCalledWith(2, "sym", sym, 1);
	}
	{
		const probe = jest.fn();
		const map = new Map();
		const sym = Symbol();
		map.set(sym, 27);
		map.set("key", 2);
		map.set("key2", 3);
		entries(map)(probe);
		expect(probe).toHaveBeenCalledTimes(3);
		expect(probe).toHaveBeenNthCalledWith(1, sym, 27, 0);
		expect(probe).toHaveBeenNthCalledWith(3, "key2", 3, 2);
	}
	{
		const probe = jest.fn();
		const set = new Set();
		const sym = Symbol();
		set.add(sym);
		set.add("key");
		set.add("key2");
		entries(set)(probe);
		expect(probe).toHaveBeenCalledTimes(3);
		expect(probe).toHaveBeenNthCalledWith(1, sym, sym, 0);
		expect(probe).toHaveBeenNthCalledWith(3, "key2", "key2", 2);
	}
});

test("deleteKeys", () => {
	expect(deleteKeys("key")({ key: "value" })).not.toHaveProperty("key");
	{
		const arr = [];
		expect(deleteKeys("length")(arr)).toHaveProperty("length");
	}
});
