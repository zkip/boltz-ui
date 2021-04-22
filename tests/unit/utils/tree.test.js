import { Tree } from "@/models/tree";
const genData = () => {
	const data = new Tree();

	return data;
};

const jackie = { name: "Jackie" };
const nicle = { name: "Nicle" };
const hatchi = { name: "Hatchi" };
const nipple = { name: "Nipple" };
const steve = { name: "Steve" };
const jhon = { name: "Jhon" };
const apple = { name: "Apple" };

test("insert", () => {
	{
		const tree = new Tree();
		tree.insert(jackie);
		tree.insert(nicle);
		expect(tree.getByPosition(0)).toEqual(jackie);
	}
	{
		const tree = new Tree();
		tree.insert(jackie);
		tree.insert(nicle, 0, 0);
		expect(tree.getByPosition(0)).toEqual(nicle);
	}
	{
		const tree = new Tree();
		tree.insert(jackie);
		tree.insert(nicle, 1, 1);
		expect(tree.getByPosition(0)).toEqual(jackie);
		expect(tree.maps.relation.child.get(jackie).has(nicle)).toBeTruthy();
		expect(tree.maps.relation.parent.get(nicle)).toEqual(jackie);
	}
	{
		const tree = new Tree();
		tree.insert(jackie);
		tree.insert(nicle, 1);
		tree.insert(hatchi, 2);
		tree.insert(nipple, 2);
		tree.insert(apple, 1);
		expect(tree.maps.relation.child.get(nicle).has(hatchi)).toBeTruthy();
		expect(tree.maps.relation.parent.get(hatchi)).toEqual(nicle);
		expect(tree.maps.relation.child.get(nicle).has(nipple)).toBeTruthy();
		expect(tree.maps.relation.parent.get(hatchi)).toEqual(nicle);
		expect(tree.maps.relation.child.get(jackie).has(apple)).toBeTruthy();
		expect(tree.maps.relation.parent.get(apple)).toEqual(jackie);
	}
});

test("remove", () => {
	{
		const tree = new Tree();
		tree.insert(jackie);
		tree.remove(jackie);
		expect(tree.container.length).toEqual(0);
		expect(tree.maps.relation.parent.size).toEqual(0);
		expect(tree.maps.relation.child.size).toEqual(0);
		expect(tree.maps.level.size).toEqual(0);
		expect(tree.maps.position.size).toEqual(0);
		expect(tree.maps.top.size).toEqual(0);
		expect(tree.meta.knot.size).toEqual(0);
	}
	{
		const tree = new Tree();
		tree.insert(jackie)({ knot: true });
		tree.insert(steve, 1);
		tree.insert(nicle, 1)({ knot: true });
		tree.insert(hatchi, 2);
		tree.insert(nipple, 2);
		tree.insert(jhon, 1);

		// tree.maps.
	}
});

test("getLevel, getByPosition, getLevelByPosition, getDataList", () => {
	const tree = new Tree();
	tree.insert(jackie);
	tree.insert(nicle, 1);
	tree.insert(hatchi, 2);
	tree.insert(nipple, 2);

	expect(tree.getLevel(hatchi)).toEqual(2);
	expect(tree.getByPosition(1)).toEqual(nicle);
	expect(tree.getLevelByPosition(3)).toEqual(2);
	expect(tree.getDataList()).toEqual(tree.container);
});

test("getAvaliableLevels", () => {
	const tree = new Tree();
	tree.insert(jackie)({ knot: true });
	tree.insert(nicle, 1)({ knot: true });
	tree.insert(hatchi, 2);
	tree.insert(nipple, 2);
	tree.insert(steve, 1, 1);
	tree.insert(jhon, 1);

	expect(tree.getAvaliableLevels(0)).toEqual([0, 0]);
	expect(tree.getAvaliableLevels(1)).toEqual([1, 1]);
	expect(tree.getAvaliableLevels(2)).toEqual([1, 1]);
	expect(tree.getAvaliableLevels(3)).toEqual([2, 2]);
	expect(tree.getAvaliableLevels(4)).toEqual([2, 2]);
	expect(tree.getAvaliableLevels(5)).toEqual([1, 2]);
	expect(tree.getAvaliableLevels(6)).toEqual([0, 1]);
});

test("getAvaliableParents", () => {
	const tree = new Tree();
	tree.insert(jackie)({ knot: true });
	tree.insert(nicle, 1)({ knot: true });
	tree.insert(hatchi, 2);
	tree.insert(nipple, 2);
	tree.insert(steve, 1, 1);

	expect(tree.getAvaliableParents(0)).toEqual([undefined]);
	expect(tree.getAvaliableParents(2)).toEqual([jackie]);
	expect(tree.getAvaliableParents(5)).toEqual([undefined, jackie, nicle]);
});

test("isContained", () => {
	const tree = new Tree();
	tree.insert(jackie);
	expect(tree.isContained(jackie)).toBeTruthy();
});

test("isOfParent", () => {
	const tree = new Tree();
	tree.insert(jackie)({ knot: true });
	tree.insert(nicle, 1)({ knot: true });
	tree.insert(hatchi, 2);
	tree.insert(nipple, 2);
	tree.insert(steve, 1, 1);

	expect(tree.isOfParent(steve, jackie)).toBeTruthy();
	expect(tree.isOfParent(nicle, jackie)).toBeTruthy();
	expect(tree.isOfParent(nipple, nicle)).toBeTruthy();
});

test("isKnot, isKnotByPosition", () => {
	const tree = new Tree();
	tree.insert(jackie)({ knot: true });
	tree.insert(nicle, 1)({ knot: true });
	tree.insert(hatchi, 2);
	tree.insert(nipple, 2);
	tree.insert(steve, 1, 1);

	expect(tree.isKnot(jackie)).toBeTruthy();
	expect(tree.isKnotByPosition(2)).toBeTruthy();
});
