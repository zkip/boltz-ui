<script lang="ts">
	import { ep } from "@/models/event";

	const button_events = ep((free, reup) => {
		function mousedown(e) {
			if (e.clientX > 500) {
				free(move);
			} else {
				reup(mousedown);
			}

			return () => {
				// mousedown removed
			};
		}
		function move() {
			return () => {
				// move removed
			};
		}

		return {
			mousedown,
			move,
		};
	});
</script>

<div>
	<button use:button_events>click me.</button>
</div>
