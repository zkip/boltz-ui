import EmptyComponent from "../Empty.svelte";
import { writable } from "svelte/store";

export function config({
	state: { item_type = EmptyComponent, payloads = [] } = {},
	hierarchy_analyzer = genHierarchyAnalyzer(),
} = {}) {
	hierarchy_analyzer.onInserted([0, payloads.length], payloads);

	return writable({
		state: { item_type, payloads },
		hierarchy_analyzer,
	});
}
