<script>
	import { onDestroy, onMount } from "svelte";
	import { get, writable } from "svelte/store";
	import { listen } from "@/utils/fn";
	import {
		// genHierarchyAnalyzer,
		// DETAILD_BEFORE,
		// DETAILD_In,
		// DETAILD_AFTER,
		EMPTY_NUMBER,
	} from "./types";
	import { config } from "./boot";
	import { isEmpty, isNotEmpty } from "@/utils/asserts";
	import ArrayMapper from "@/utils/indices/ArrayMapper";
	import { inArrayBound } from "@/utils/array";
	import EmptyComponent from "../Empty";
	import DefaultHolder from "./Holder";

	export let data = config();
	export let is_fixture = false;
	export let holder = DefaultHolder;

	let payloads, item_type, hierarchy_analyzer;
	let Item;

	let lineheight = 24;
	let items = [];

	let thumb_data = config();
	let thumb_offset = 0;

	let actived_index = EMPTY_NUMBER;

	let top_node;

	let cleaners = [];

	$: payloads = $data.state.payloads;
	$: Item = item_type = $data.state.item_type;
	$: hierarchy_analyzer = $data.hierarchy_analyzer;

	onMount(() => {
		const clean_drag = listen(
			"mousedown",
			top_node
		)(({ clientX, clientY }) => {
			const bound = top_node.getBoundingClientRect();
			const ix = clientX;
			const iy = clientY;

			const local_offset = (clientY - bound.y) % lineheight;
			const init_index = (clientY - bound.y - local_offset) / lineheight;

			const payloads_locked = payloads.clone();
			const hierarchy_analyzer_locked = hierarchy_analyzer.clone();

			const init_payload_node_position = init_index * lineheight;

			const init_payload = payloads_locked.list[init_index];

			let live_index;

			const volume = hierarchy_analyzer.getVolume(
				init_index,
				payloads_locked.list
			);
			const culled = payloads_locked.splice(init_index, volume);
			hierarchy_analyzer_locked.onRemoved(culled);

			const clean_move = listen("mousemove")(function DumpDDD({
				clientX,
				clientY,
			}) {
				const dx = clientX - ix;
				const dy = clientY - iy;
				const payloads_live = payloads_locked.clone();
				const hierarchy_analyzer_live = hierarchy_analyzer_locked.clone();
				const hierarchy_map_live = hierarchy_analyzer.getHierarchyMap();

				// const live_index = ((clientY - bound.y) / lineheight) >> 0;

				const local_offset = (clientY - bound.y) % lineheight;

				live_index = (clientY - bound.y - local_offset) / lineheight;

				live_index = inArrayBound(payloads.list)(live_index);

				const prev_index = live_index - 1;
				const next_index = live_index;

				const is_first = live_index === 0;
				const is_last = live_index === payloads_live.list.length - 1;
				const init_relation =
					hierarchy_map_live.relation[init_payload.id];

				const live_payload = payloads_live.list[live_index] || {};
				const prev_payload = payloads_live.list[prev_index] || {};
				const next_payload = payloads_live.list[next_index] || {};

				const prev_relation =
					hierarchy_map_live.relation[prev_payload.id] || {};
				const live_relation =
					hierarchy_map_live.relation[live_payload.id] || {};

				const init_level = init_payload.level;
				const live_level = live_payload.level;
				const prev_level = prev_payload.level;

				const prev_parent_payload = payloads_live.get(
					prev_relation.parent
				);

				const prev_is_parent =
					prev_payload.id in hierarchy_map_live.size;
				const live_is_parent =
					live_payload.id in hierarchy_map_live.size;
				const holder_payload = {
					...init_payload,
					type_self: holder,
				};

				let maybe_level = live_payload.level;

				// < 0 : top, > 0 : bottom
				const direction = live_index - init_index;

				actived_index = live_index;

				if (direction > 0) {
					if (is_last) {
						maybe_level = prev_payload.level;
					} else {
						maybe_level = live_payload.level;
					}
				} else if (direction < 0) {
					if (is_first) {
					} else {
						maybe_level = prev_is_parent
							? prev_level + 1
							: prev_level;
					}
				} else {
					maybe_level = culled[0].level;
				}

				const allowed_jump = false;

				const is_last_child = isEmpty(live_relation.next_sibling);

				// console.log(is_last_child, "@@@@");

				const allowed_levels = [];

				holder_payload.level = maybe_level;

				const x = clientX - ix;
				// const should_level = init_level + x / 20;
				const should_level = 0;

				// thumb holder
				$thumb_data.state.item_type = item_type;
				$thumb_data.state.payloads = ArrayMapper([
					{ ...init_payload, level: maybe_level },
				]);
				thumb_data.set($thumb_data);
				thumb_offset = init_payload_node_position + dy;

				const compensation = direction < 0 ? 0 : -1;

				payloads_live.splice(live_index, 0, ...culled);
				const results = hierarchy_analyzer_live.onInserted(
					[live_index, culled.length],
					payloads_live.list,
					maybe_level
				);

				// console.log(results, "@@");

				$data.state.payloads = payloads_live;
				$data.hierarchy_analyzer = hierarchy_analyzer_live;
				data.set($data);
			});

			const clean_up = listen("mouseup")(() => {
				clean_move();
				clean_up();

				actived_index = EMPTY_NUMBER;

				if (isNotEmpty(live_index)) {
					payloads.splice(live_index, 1, init_payload);
				}

				$thumb_data.state.item_type = EmptyComponent;
				$thumb_data.state.payloads = ArrayMapper();
				thumb_data.set($thumb_data);

				console.log(hierarchy_analyzer.getHierarchyMap().relation);
			});
		});
		cleaners.push(clean_drag);
	});

	onDestroy(() => {
		cleaners.map((cleaner) => cleaner());
	});

	let getNodeCls = () => {};
	let getItem = ({ index }) => {
		const { type_self = Item } = payloads.list[index];
		return type_self;
	};

	$: getNodeCls = ({ index }) => {
		return ["node", index === actived_index ? "actived" : false]
			.filter(Boolean)
			.join(" ");
	};

	const cls = ["Outline", is_fixture && "fixture"].filter(Boolean);
</script>

<div class={cls.join(" ")} bind:this={top_node}>
	{#if !is_fixture}
		<div class="holder">
			<div class="thumb" style="top: {thumb_offset}px">
				<svelte:self data={thumb_data} is_fixture={true} />
			</div>
		</div>
	{/if}
	<div class="list">
		{#each payloads.list as { props, level }, index}
			<div class={getNodeCls({ index })} bind:this={items[index]}>
				<div class="item" style="padding-left: {level * 20}px">
					<svelte:component this={getItem({ index })} {...props} />
				</div>
			</div>
		{/each}
	</div>
</div>

<style scoped>
	.Outline {
		user-select: none;
		display: grid;
	}
	.Outline > * {
		grid-column: 1 / 2;
		grid-row: 1 / 2;
	}
	.Outline > .holder {
		z-index: 2;
		pointer-events: none;
		position: relative;
	}
	.Outline > .holder > .thumb {
		position: absolute;
		width: 100%;
	}
	.Outline > .list {
		z-index: 1;
	}
	.node .item {
		height: 24px;
		border: 1px solid pink;
		box-sizing: border-box;
	}
	.Outline:not(.fixture) .node.actived {
		box-sizing: border-box;
		border: 1px dashed rebeccapurple;
		background: rgba(102, 51, 153, 0.103);
	}
</style>
