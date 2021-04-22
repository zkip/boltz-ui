<script>
	export let is_show = true;
</script>

<div>
	{#if is_show}
		<span>Hel<span>BBB</span>lo</span>
		<span>Hello</span>
	{:else}
		<div>World</div>
	{/if}
</div>
