<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let icon: string | null = null;
	export let label: string;
	export let kind: "normal" | "danger" = "normal";
	export let grow: boolean = false;

	type Events = {
		click: void
	}

	const dispatch = createEventDispatcher<Events>();

	function onClick() {
		dispatch("click");
	}
</script>

<button class="root" on:click={onClick} data-kind={kind} data-grow={grow}>
	{#if icon}
		<div class="icon">
			<span class="material-symbols-rounded">{icon}</span>
		</div>
	{/if}
	<div class="label">{label}</div>
</button>

<style lang="scss">
	.root {
		all: unset;

		&:focus {
			outline: revert;
		}

		&[data-kind=normal] {
			--bg-color: #2866df;
			--bg-color-hovered: #215ac8;
		}

		&[data-kind=danger] {
			--bg-color: #c72636;
			--bg-color-hovered: #a82633;
		}

		&[data-grow=true] {
			flex-grow: 1;
		}

		background-color: var(--bg-color);
		color: #ffffff;
		padding: 4px 12px;
		min-height: calc(28px - 4px * 2);
		font-size: 13px;
		font-weight: 600;
		border-radius: 4px;
		cursor: pointer;

		display: flex;
		flex-direction: row;
		gap: 5px;
		align-items: center;
		justify-content: center;

		.label {
			font-weight: 500;
		}

		&:hover {
			background-color: var(--bg-color-hovered);
			box-shadow: 0 1px 4px rgba(58, 58, 58, 0.5), 0 0 6px rgba(0, 0, 0, 0.5);
		}

		.icon {
			display: flex;
			height: 18px;

			span {
				font-size: 18px;
			}
		}
	}
</style>