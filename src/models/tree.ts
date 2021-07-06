import { Bound, isNotFound, noop } from "@/utils/constants";

export interface TreeMeta<Data extends object> {
	knot: WeakSet<Data>;
	virtual: WeakSet<Data>;
}

type TreeMetaOption<Data extends object> = {
	[key in keyof TreeMeta<Data>]?: boolean;
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
		if (!isNotFound(option.knot)) {
			this.setKnot(data, option.knot);
		}
		if (!isNotFound(option.virtual)) {
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

		if (isNotFound(startPosition)) return [];

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

		if (
			!isNotFound(subtreeRootParent) &&
			this.maps.relation.firstChild.get(subtreeRootParent) === data
		) {
			if (subtreeRootNextSibling) {
				this.maps.relation.firstChild.set(
					subtreeRootParent,
					subtreeRootNextSibling
				);
			} else {
				this.maps.relation.firstChild.delete(subtreeRootParent);
			}
		}
		if (
			!isNotFound(subtreeRootParent) &&
			this.maps.relation.lastChild.get(subtreeRootParent) === data
		) {
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

	removeByPosition(position: number) {
		return this.remove(this.getByPosition(position));
	}

	protected resolvePrevSiblingByPositionAndLevel(
		position: number,
		level: number
	): Data | undefined {
		const relParentM = this.maps.relation.parent;
		const find = (target: Data): Data | undefined => {
			const levelTarget = this.getLevel(target);
			if (level === levelTarget) {
				return target;
			} else {
				const secondTarget = relParentM.get(target);
				if (!isNotFound(secondTarget)) {
					return find(secondTarget);
				}
			}
		};

		if (position !== 0) {
			return find(this.getByPosition(position - 1));
		}
	}

	protected updatePositionOnInserted(startIndex: number, count = 1) {}
	protected updatePositionOnRemoved(startIndex: number, count = 1) {}
	protected updatePositionOnUpdated(index: number) {}

	getPrevSibling(data: Data) {
		return this.maps.relation.prevSibling.get(data);
	}
	getNextSibling(data: Data) {
		return this.maps.relation.nextSibling.get(data);
	}

	// only in second generation
	getFirstChild(data: Data) {
		return this.maps.relation.firstChild.get(data);
	}
	// only in second generation
	getLastChild(data: Data) {
		return this.maps.relation.lastChild.get(data);
	}
	getFirstChildRecursive(data: Data) {
		const find = (data: Data): Data | undefined => {
			const secondTarget = this.getFirstChild(data);
			if (!isNotFound(secondTarget)) {
				return find(secondTarget);
			} else {
				return data;
			}
		};
		return find(data);
	}
	getLastChildRecursive(data: Data) {
		const find = (data: Data): Data | undefined => {
			const secondTarget = this.getLastChild(data);
			if (!isNotFound(secondTarget)) {
				return find(secondTarget);
			} else {
				return data;
			}
		};
		return find(data);
	}
	getChildCount(data: Data) {
		const firstChild = this.getFirstChild(data);
		const lastChild = this.getLastChildRecursive(data);
		if (isNotFound(firstChild) || isNotFound(lastChild)) return 0;

		const firstPosition = this.getPosition(firstChild);
		const lastPosition = this.getPosition(lastChild);
		if (isNotFound(firstPosition) || isNotFound(lastPosition)) return 0;

		const hasChildren = firstChild || lastChild;

		const startPosition = hasChildren ? firstPosition : 0;
		const endPosition = hasChildren ? lastPosition : 0;
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
		if (isNotFound(prevLevel)) return [0, 0];

		const isKnot = this.isKnot(prevData);
		const isOvering = this.container.length === position;
		const max = isFirst ? 0 : prevLevel + (isKnot ? 1 : 0);
		const min = isOvering ? 0 : this.getLevelByPosition(position);
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

		let target: Data | undefined = data;
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
