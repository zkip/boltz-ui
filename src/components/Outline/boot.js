import EmptyComponent from "../Empty";
import { writable } from "svelte/store";
import ArrayMapper from "@/utils/indices/ArrayMapper";

export function config({
	state: { item_type = EmptyComponent, payloads = [] } = {},
	hierarchy_analyzer = genHierarchyAnalyzer(),
} = {}) {
	hierarchy_analyzer.onInserted([0, payloads.length], payloads);

	return writable({
		state: { item_type, payloads: ArrayMapper(payloads) },
		hierarchy_analyzer,
	});
}
