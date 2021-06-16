import { entries } from "@/utils/object";
import { last, repeat } from "@/utils/array";
import { isNotEmpty } from "@/utils/asserts";

export class Tree {
	container = new Array();
	maps = {
		relation: {
			parent: new Map(),
			child: new Map(),
		},
		level: new Map(),
		position: new Map(),

		top: new Set(),
	};
	meta = {
		knot: new Set(),
	};

	// <Data> : bool
	setKnot(data, ok) {
		if (ok) {
			this.meta.knot.add(data);
		} else {
			this.meta.knot.delete(data);
		}
	}
	// <Data> : Tree.Meta
	setMeta(data, meta) {
		const self = this;
		entries(meta)((k, v) => {
			if (k === "knot") {
				self.setKnot(data, v);
			}
		});
	}
	getLevel(data) {
		return this.maps.level.get(data);
	}

	getDataList() {
		return this.container;
	}
	// <Data>, uint
	insert(data, level = 0, position = this.container.length) {
		this.container.splice(position, 0, data);
		if (position !== 0) {
			const parent = this.resolveParentByPositionAndLevel(
				position,
				level
			);
			if (isNotEmpty(parent)) {
				this.maps.relation.parent.set(data, parent);
				const children =
					this.maps.relation.child.get(parent) || new Set();
				this.maps.relation.child.set(parent, children);
				children.add(data);
			}
		}
		this.maps.level.set(data, level);
		this.maps.position.set(data, position);

		if (level === 0) {
			this.maps.top.add(data);
		}
		return (...args) => (this.setMeta(data, ...args), undefined);
	}
	// <Data>
	remove(data) {
		const position = this.getPosition(data);
		this.container.splice(position, 1);
		// relation remove
	}
	// uint
	removeByPositoin(position) {
		this.container.splice(position, 1);
		// relation remove
	}
	// uint, object
	updateByPosition(position, payload) {
		const data = this.container[position];
		entries(payload)((k, v) => {
			data[k] = v;
		});
		// relation remove
	}
	resolveParentByPositionAndLevel(position, level) {
		let self = this;
		function find(target) {
			const level_target = self.getLevel(target);
			const dist = level - level_target;
			if (dist === 1) {
				return target;
			} else {
				const target_parent = self.maps.relation.parent.get(target);
				if (isNotEmpty(target_parent)) {
					return find(target_parent);
				}
			}
		}

		if (position !== 0) {
			return find(this.getByPosition(position - 1));
		}
		return undefined;
	}
	// uint : <Data>
	getByPosition(position) {
		return this.container[position];
	}
	getLevelByPosition(position) {
		const data = this.getByPosition(position);
		return this.maps.level.get(data);
	}

	// uint : Order<<Data>> -- level ASC
	getAvaliableParents(position) {
		const [min, max] = this.getAvaliableLevels(position);
		return repeat(max - min + 1)((i) =>
			this.resolveParentByPositionAndLevel(position, min + i)
		);
	}
	// uint : Range<uint> -- insert before
	getAvaliableLevels(position) {
		const is_first = position === 0;
		const prev_data = this.getByPosition(position - 1);
		const prev_level = this.getLevel(prev_data);
		const is_knot = this.isKnot(prev_data);
		const is_overing = this.container.length === position;
		const max = is_first ? 0 : prev_level + (is_knot ? 1 : 0);
		let min = is_overing ? 0 : this.getLevelByPosition(position);
		return [min, max];
	}
	// <Data> : <Data>
	getParent(data) {}
	// unit : <Data>
	getParentByPosition(position) {}
	// <Data> : []<Data>
	getParents(data) {}
	// <Data> : []<Data>
	getChildren(data) {}

	// <Data> : uint
	getPosition(data) {
		return this.maps.position.get(data);
	}

	// assertions

	// : bool
	isValid() {}

	// <Data> : bool
	isKnot(data) {
		return this.meta.knot.has(data);
	}
	// uint : bool
	isKnotByPosition(position) {
		const data = this.getByPosition(position);
		return this.isKnot(data);
	}
	// <Data> : bool
	isContained(data) {
		return this.maps.position.has(data);
	}
	// <Data>, <Data> : bool
	isOfParent(data, parent) {
		return this.maps.relation.parent.get(data) === parent;
	}
	// <Data> : bool
	isTop(data) {
		return this.maps.top.has(data);
	}
	// <Data> : bool
	isEnd(data) {
		return this.maps.end.has(data);
	}
	// <Data> : bool
	isEdge(data) {
		// return
	}
	// <Data> : bool
	isEdgeStart() {}
	// <Data> : bool
	isEdgeEnd() {}
}
