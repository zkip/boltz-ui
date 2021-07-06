import { Bound, noop } from "@/utils/constants";

export interface TreeMeta<Data extends object> {
	knot?: WeakSet<Data>;
	virtual?: WeakSet<Data>;
}

type TreeMetaOption<Data extends object> = {
	[key in keyof TreeMeta<Data>]: boolean;
};

export class Tree<Data extends object> {
	protected container: Data[] = [];
	protected maps = {
		relation: {
			parent: new WeakMap<Data, Data>(),
			firstChild: new WeakMap<Data, Data>(),
			lastChild: new WeakMap<Data, Data>(),
			prevSibling: new WeakMap<Data, Data>(),
			nextSibling: new WeakMap<Data, Data>(),
		},
		level: new WeakMap<Data, number>(),
		position: new WeakMap<Data, number>(),

		top: new WeakSet<Data>(),
	};
	protected meta: TreeMeta<Data> = {
		knot: new WeakSet(),
		virtual: new WeakSet(),
	};

	setKnot(data: Data, ok: boolean) {
		if (ok) {
			this.meta.knot.add(data);
		} else {
			this.meta.knot.delete(data);
		}
	}
	setVirtual(data: Data, ok: boolean) {
		if (ok) {
			this.meta.virtual.add(data);
		} else {
			this.meta.virtual.delete(data);
		}
	}
	setMeta(data: Data, option: TreeMetaOption<Data>) {
		if ("knot" in option) {
			this.setKnot(data, option.knot);
		}
		if ("virtual" in option) {
			this.setVirtual(data, option.virtual);
		}
	}

	protected insert(data: Data, position: number, level: number) {
		this.container.splice(position, 0, data);

		const prevSibling = this.resolvePrevSiblingByPositionAndLevel(
			position,
			level
		);

		const nextOne = this.getByPosition(position);
		const nextSibling =
			nextOne && (level === this.getLevel(nextOne) ? nextOne : undefined);

		const parent =
			prevSibling && this.maps.relation.parent.get(prevSibling);

		if (prevSibling) {
			this.maps.relation.prevSibling.set(data, prevSibling);
			this.maps.relation.nextSibling.set(prevSibling, data);
		} else {
			if (parent) {
				this.maps.relation.firstChild.set(parent, data);
			}
		}

		if (nextSibling) {
			this.maps.relation.nextSibling.set(data, nextSibling);
			this.maps.relation.prevSibling.set(nextSibling, data);
		} else {
			if (parent) {
				this.maps.relation.lastChild.set(parent, data);
			}
		}

		this.maps.level.set(data, level);

		this.updatePositionOnInserted(position);

		if (level === 0) {
			this.maps.top.add(data);
		}
		return this.setMeta.bind(this, data);
	}

	tryToInsert(
		data: Data,
		position = this.container.length,
		level = 0
	): (option: TreeMetaOption<Data>) => void | typeof noop {
		const [min, max] = this.getAvaliableLevelBound(position);

		const isValid = level >= min && level <= max;

		return isValid ? this.insert.bind(this, data, position, level) : noop;
	}

	// remove subtree
	remove(data: Data) {
		const childCount = this.getChildCount(data);
		const startPosition = this.getPosition(data);

		const dataList = this.container.splice(startPosition, childCount + 1);

		// clean maps
		for (const data of dataList) {
			this.maps.position.delete(data);
			this.maps.level.delete(data);
			this.maps.top.delete(data);
			this.maps.relation.parent.delete(data);
			this.maps.relation.prevSibling.delete(data);
			this.maps.relation.nextSibling.delete(data);
			this.maps.relation.firstChild.delete(data);
			this.maps.relation.lastChild.delete(data);
		}
		const [subtreeRoot] = dataList;
		const subtreeRootParent = this.getParent(subtreeRoot);
		const subtreeRootPrevSibing = this.getPrevSibling(subtreeRoot);
		const subtreeRootNextSibling = this.getNextSibling(subtreeRoot);

		if (this.maps.relation.firstChild.get(subtreeRootParent) === data) {
			if (subtreeRootNextSibling) {
				this.maps.relation.firstChild.set(
					subtreeRootParent,
					subtreeRootNextSibling
				);
			} else {
				this.maps.relation.firstChild.delete(subtreeRootParent);
			}
		}
		if (this.maps.relation.lastChild.get(subtreeRootParent) === data) {
			if (subtreeRootPrevSibing) {
				this.maps.relation.lastChild.set(
					subtreeRootParent,
					subtreeRootPrevSibing
				);
			} else {
				this.maps.relation.lastChild.delete(subtreeRootParent);
			}
		}
		if (subtreeRootPrevSibing) {
			if (subtreeRootNextSibling) {
				this.maps.relation.nextSibling.set(
					subtreeRootPrevSibing,
					subtreeRootNextSibling
				);
			} else {
				this.maps.relation.nextSibling.delete(subtreeRootPrevSibing);
			}
		}
		if (subtreeRootNextSibling) {
			if (subtreeRootPrevSibing) {
				this.maps.relation.nextSibling.set(
					subtreeRootNextSibling,
					subtreeRootPrevSibing
				);
			} else {
				this.maps.relation.nextSibling.delete(subtreeRootNextSibling);
			}
		}

		this.updatePositionOnRemoved(startPosition, childCount);

		return dataList;
	}

	// update subtree
	update(data: Data, position: number, level: number) {}

	removeByPosition(position: number) {
		return this.remove(this.getByPosition(position));
	}

	protected resolvePrevSiblingByPositionAndLevel(
		position: number,
		level: number
	): Data | undefined {
		const relParentM = this.maps.relation.parent;
		function find(target: Data) {
			const levelTarget = this.getLevel(target);
			if (level === levelTarget) {
				return target;
			} else {
				if (relParentM.has(target)) {
					return find(relParentM.get(target));
				}
			}
		}

		if (position !== 0) {
			return find(this.getByPosition(position - 1));
		}
	}

	protected updatePositionOnInserted(startIndex: number, count = 1) {}
	protected updatePositionOnRemoved(startIndex: number, count = 1) {}
	protected updatePositionOnUpdated(index) {}

	getPrevSibling(data: Data) {
		return this.maps.relation.prevSibling.get(data);
	}
	getNextSibling(data: Data) {
		return this.maps.relation.nextSibling.get(data);
	}

	// only in second generation
	getSecondFirstChild(data: Data) {
		return this.maps.relation.firstChild.get(data);
	}
	// only in second generation
	getSecondLastChild(data: Data) {
		return this.maps.relation.lastChild.get(data);
	}
	getFirstChild(data: Data) {
		const { relation: relationM } = this.maps;
		function find(data: Data) {
			if (relationM.firstChild.has(data)) {
				return find(relationM.firstChild.get(data));
			} else {
				return data;
			}
		}
		return find(data);
	}
	getLastChild(data: Data) {
		const { relation: relationM } = this.maps;
		function find(data: Data) {
			if (relationM.lastChild.has(data)) {
				return find(relationM.lastChild.get(data));
			} else {
				return data;
			}
		}
		return find(data);
	}
	getChildCount(data: Data) {
		const firstChild = this.getSecondFirstChild(data);
		const lastChild = this.getLastChild(data);

		const hasChildren = firstChild || lastChild;

		const startPosition = hasChildren
			? this.maps.position.get(firstChild)
			: 0;
		const endPosition = hasChildren ? this.maps.position.get(lastChild) : 0;
		const count = endPosition - startPosition + 1;

		return hasChildren ? count : 0;
	}
	getLevel(data: Data) {
		return this.maps.level.get(data);
	}
	getDataList() {
		return this.container;
	}
	getByPosition(position: number) {
		return this.container[position];
	}
	getLevelByPosition(position: number) {
		const data = this.getByPosition(position);
		return this.maps.level.get(data);
	}

	getAvaliableLevelBound(position: number) {
		const isFirst = position === 0;
		const prevData = this.getByPosition(position - 1);
		const prevLevel = this.getLevel(prevData);
		const isKnot = this.isKnot(prevData);
		const isOvering = this.container.length === position;
		const max = isFirst ? 0 : prevLevel + (isKnot ? 1 : 0);
		let min = isOvering ? 0 : this.getLevelByPosition(position);
		return [min, max] as Bound;
	}
	getParent(data: Data) {
		return this.maps.relation.parent.get(data);
	}
	getParentByPosition(position: number) {
		const data = this.getByPosition(position);
		return this.getParent(data);
	}
	getParentChain(data: Data) {
		const chain: Data[] = [];

		let target = data;
		while ((target = this.maps.relation.parent.get(target)))
			chain.push(target);

		return chain;
	}
	getChildren(data: Data) {}
	getPosition(data: Data) {
		return this.maps.position.get(data);
	}

	// assertions

	// : bool
	isValid() {}

	isKnot(data: Data) {
		return this.meta.knot.has(data);
	}
	isVirtual(data: Data) {
		return this.meta.virtual.has(data);
	}
	isKnotByPosition(position: number) {
		const data = this.getByPosition(position);
		return this.isKnot(data);
	}
	isVirtualByPosition(position: number) {
		const data = this.getByPosition(position);
		return this.isKnot(data);
	}
	isContained(data: Data) {
		return this.maps.position.has(data);
	}
	isOfParent(data: Data, parent: Data) {
		return this.maps.relation.parent.get(data) === parent;
	}
	isTop(data: Data) {
		return this.maps.top.has(data);
	}
	isLeaf(data: Data) {
		return !this.maps.relation.parent.has(data);
	}
}
