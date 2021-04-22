import { isEmpty, isNotEmpty } from "@/utils/asserts";
import { fallback } from "@/utils/fn";
import { Relation } from "./types";

export function genHierarchyAnalyzer({} = {}) {
	function constructor({ hierarchy_map = { relation: {}, size: {} } } = {}) {
		let {
			relation: live_relation_map,
			size: live_size_map,
		} = hierarchy_map;

		// provider { ?shore_index }
		function onInsertedUnit(
			{ id, level },
			index,
			payloads,
			{ is_coverage = true, provider = {} } = {}
		) {
			const { shore_index } = provider;

			const is_first = index === 0;
			const is_top = level === 0;
			const is_last = index === payloads.length - 1;
			const prev_index = index - 1;
			const next_index = fallback(index + 1)(shore_index);
			const prev_id = is_first ? undefined : payloads[prev_index].id;
			const next_id = is_last ? undefined : payloads[next_index].id;
			const prev_payload = payloads[prev_index];
			const next_payload = payloads[next_index];
			const prev_level = !is_first && prev_payload.level;
			const next_level = !is_last && next_payload.level;
			const diff_prev_level = !is_first && level - prev_level;
			const diff_next_level = !is_last && level - next_level;
			const prev_sibling_id = getRecursiveParent(
				prev_id,
				-diff_prev_level
			);
			const next_in_relation_map = next_id in live_relation_map;

			// > : undefined, == : next one
			const next_sibling_id =
				next_level === level && next_in_relation_map
					? next_id
					: undefined;

			if (!isValid(index, level, payloads, { provider })) {
				return false;
			}

			const relation = fallback(Relation(id))(live_relation_map[id]);
			const prev_relation = fallback(Relation())(
				live_relation_map[prev_id]
			);
			const prev_relation_parent_id = prev_relation.parent;

			const prev_sibling_relation = fallback(Relation())(
				live_relation_map[prev_sibling_id]
			);
			const next_sibling_relation = fallback(Relation())(
				live_relation_map[next_sibling_id]
			);

			let parent_relation = fallback(Relation())(
				diff_prev_level > 0
					? live_relation_map[prev_relation.id]
					: diff_prev_level === 0
					? live_relation_map[prev_relation_parent_id]
					: live_relation_map[prev_sibling_relation.parent]
			);

			const will_relation = {};
			const will_prev_sibling_relation = {};
			const will_next_sibling_relation = {};
			const will_parent_relation = {};

			if (diff_prev_level > 0) {
				will_parent_relation.child = id;

				will_relation.next_sibling = next_sibling_id;

				if (isNotEmpty(next_sibling_id)) {
					will_next_sibling_relation.prev_sibling = id;
				}
			} else if (diff_prev_level === 0) {
				will_relation.prev_sibling = prev_sibling_id;

				if (isNotEmpty(prev_sibling_id)) {
					will_prev_sibling_relation.next_sibling = id;
				}
				if (isNotEmpty(next_sibling_id)) {
					will_next_sibling_relation.prev_sibling = id;
				}
			} else {
				will_relation.prev_sibling = prev_sibling_id;
				will_relation.next_sibling = next_sibling_id;

				will_prev_sibling_relation.next_sibling = id;
				will_next_sibling_relation.prev_sibling = id;
			}

			if (!is_top) {
				will_relation.parent = parent_relation.id;

				const size = fallback(0)(live_size_map[will_relation.parent]);
				live_size_map[will_relation.parent] = size + 1;

				live_relation_map[will_relation.parent] = {
					...parent_relation,
					...will_parent_relation,
				};
			}

			live_relation_map[id] = { ...relation, ...will_relation };

			if (isNotEmpty(prev_sibling_id)) {
				live_relation_map[prev_sibling_id] = {
					...prev_sibling_relation,
					...will_prev_sibling_relation,
				};
			}

			// TODO: Need to optimize, when inserting a subtree, there will be double-counted.
			// if (is_coverage) {
			if (isNotEmpty(next_sibling_id)) {
				live_relation_map[next_sibling_id] = {
					...next_sibling_relation,
					...will_next_sibling_relation,
				};
			}
			// }

			return true;
		}

		// type HierarchyNode Payload
		function onInserted(sub_tree_range, payloads, level) {
			const [start, span = 1] = sub_tree_range;

			if (start >= payloads.length) return [];

			const backup = clone();

			const top_level = payloads[start].level;
			const base_level = fallback(top_level)(level);

			const shore_index =
				span < payloads.length ? start + span : undefined;

			for (let i = 0; i < span; i++) {
				const index = start + i;
				const { id, level } = payloads[index];
				const relative_level = level - top_level;
				const should_level = base_level + relative_level;

				let result = onInsertedUnit(
					{ id, level: should_level },
					index,
					payloads,
					{
						provider: { shore_index },
					}
				);

				console.log(result, "@@");

				if (!result) {
					apply(backup);
					return false;
				}

				// affect to payloads
				payloads[index].level = should_level;
			}
			return true;
		}

		function getRecursiveParent(id, count = 0) {
			if (count < 0) {
				return undefined;
			}

			if (count > 0 && id) {
				const parent_id =
					live_relation_map[id] && live_relation_map[id].parent;
				return getRecursiveParent(parent_id, count - 1);
			} else {
				return id;
			}
		}

		function onRemoved(culled) {
			const start_node = culled[0];
			const start_id = start_node.id;

			const relation = live_relation_map[start_id];

			const { prev_sibling, next_sibling, parent } = relation;
			const prev_sibling_relation = live_relation_map[prev_sibling];
			const next_sibling_relation = live_relation_map[next_sibling];

			const parent_relation = live_relation_map[parent];

			if (isNotEmpty(parent) && parent_relation.child === start_id) {
				live_relation_map[parent].child = next_sibling;
			}

			if (isNotEmpty(prev_sibling_relation)) {
				live_relation_map[prev_sibling] = {
					...prev_sibling_relation,
					next_sibling,
				};
			}
			if (isNotEmpty(next_sibling_relation)) {
				live_relation_map[next_sibling] = {
					...next_sibling_relation,
					prev_sibling,
				};
			}
			if (isNotEmpty(parent) && parent_relation.child === start_id) {
				live_relation_map[parent] = {
					...parent_relation,
					next_sibling,
				};
			}

			for (let i = 0; i < culled.length; i++) {
				const { id } = culled[i];

				const is_fork = id in live_size_map;

				if (is_fork) {
					delete live_size_map[id];
				}

				delete live_relation_map[id];
			}

			if (isNotEmpty(parent)) {
				live_size_map[relation.parent]--;
			}
		}

		function isValid(
			index,
			level,
			payloads,
			{ is_log, provider = {} } = {}
		) {
			const { shore_index } = provider;

			const is_first = index === 0;
			const is_last = index === payloads.length - 1;
			const prev_index = index - 1;
			const next_index = fallback(index + 1)(shore_index);
			const prev_id = !is_first ? payloads[prev_index].id : undefined;
			const next_id = !is_last ? payloads[next_index].id : undefined;
			const prev_payload = payloads[prev_index];
			const next_payload = payloads[next_index];
			const prev_level = !is_first ? prev_payload.level : undefined;
			const next_level = !is_last ? next_payload.level : undefined;
			const prev_relation = live_relation_map[prev_id];
			const next_relation = live_relation_map[next_id];
			const { id } = payloads[index];

			let is_last_child = false;

			if (is_last) {
				is_last_child = true;
			} else {
				if (
					!is_first &&
					prev_relation &&
					isEmpty(prev_relation.next_sibling)
				) {
					is_last_child = true;
				} else if (!next_relation) {
					is_last_child = true;
				}
			}

			const avaliable_level_max = !is_first ? prev_level + 1 : undefined;
			const is_prow = next_level > prev_level;
			let avaliable_level_min = is_last_child
				? isNotEmpty(next_relation)
					? next_level
					: 0
				: !is_first
				? prev_level + (is_prow ? 1 : 0)
				: undefined;

			if (is_log) {
				console.log(
					avaliable_level_min,
					avaliable_level_max,
					"@@@@@@",
					prev_id,
					index,
					is_last_child,
					level
				);
			}

			if (is_first) {
				return level === 0;
			} else {
				return (
					level >= avaliable_level_min && level <= avaliable_level_max
				);
			}
		}

		function getVolume(index, payloads) {
			const { id } = payloads[index];

			function find(fork_id) {
				let size = 0;
				do {
					if (!fork_id) continue;
					const fork = live_relation_map[fork_id] || {};
					if (fork.child) {
						size += find(fork.child);
					}
					fork_id = live_relation_map[fork_id].next_sibling;
					size++;
				} while (fork_id);
				return size;
			}

			const fork_id = live_relation_map[id].child;
			return find(fork_id) + 1;
		}

		function clone() {
			return constructor({
				hierarchy_map: {
					relation: { ...live_relation_map },
					size: { ...live_size_map },
				},
			});
		}

		function apply(hierarchy_analyzer) {
			const hierarchy_map_will = hierarchy_analyzer.getHierarchyMap();
			hierarchy_map.relation = { ...hierarchy_map_will.relation };
			hierarchy_map.size = { ...hierarchy_map_will.size };
		}

		function getHierarchyMap() {
			return hierarchy_map;
		}

		const exports = {
			getVolume,
			clone,
			apply,
			onInserted,
			onRemoved,
			getHierarchyMap,
		};

		return Object.assign([exports], exports);
	}

	return constructor({});
}
