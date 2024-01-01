<script lang="ts">
	import { createEventDispatcher } from "svelte";

	type Optional<T> = T | undefined;

	export let value: string = "";
	export let icon: Optional<string> = undefined;
	export let placeholder: Optional<string> = undefined;
	export let maxLength: Optional<number> = undefined;

	type Events = {
		enter: string
	}

	const dispatch = createEventDispatcher<Events>();

	type HTMLEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLInputElement;
	}

	function onKeydown(event: HTMLEvent) {
		if (event.key === "Enter") {
			dispatch("enter", value);
		}
	}
</script>

<div class="root">
	{#if icon}
		<div class="icon">
			<span class="material-symbols-rounded">{icon}</span>
		</div>
	{/if}
	<input class="input" type="text" bind:value={value} placeholder={placeholder} on:keydown={onKeydown} maxlength={maxLength} />
</div>

<style lang="scss">
	.root {
		display: flex;
		flex-direction: row;
		gap: 5px;
		align-items: center;

		border: 1px solid #3a3a3a;
		border-radius: 4px;
		padding: 5px;
		margin: 0;

		.icon {
			display: flex;
			height: 18px;

			span {
				font-size: 18px;
				color: #e8e8e8;
			}
		}

		.input {
			all: unset;
			font-size: 14px;
			flex-grow: 1;
		}
	}
</style>