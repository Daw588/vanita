<script lang="ts">
	import PrimaryButton from "./PrimaryButton.svelte";

	type Action = {
		label: string,
		icon?: string,
		kind?: "normal" | "danger",
		onClick: () => void
	}

	export let actions: Action[] = [];
	export let title: string;
	export let description: string;
	export let visible: boolean;
	export let allowHTML: boolean = false;
</script>

<div class="root" data-visible={visible}>
	<div class="backdrop"></div>
	<div class="window">
		<div class="header">{title}</div>
		
		{#if allowHTML}
			<div class="description">{@html description}</div>
		{:else}
			<div class="description">{description}</div>
		{/if}

		<div class="actions">
			{#each actions as action}
				<PrimaryButton
					label={action.label}
					icon={action.icon}
					kind={action.kind}
					on:click={action.onClick} />
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.root {
		z-index: 10;

		position: fixed;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		display: flex;
		align-items: center;
		justify-content: center;

		transition:
				visibility 120ms ease;

		&[data-visible=true] {
			visibility: visible;

			.window {
				transform: translateY(0);
			}
		}

		&[data-visible=false] {
			visibility: collapse;

			.window {
				transform: translateY(-100vh);
			}
		}

		.backdrop {
			position: fixed;
			top: 0;
			left: 0;

			width: 100%;
			height: 100%;

			background-color: rgba(0, 0, 0, 0.5);
		}

		.window {
			z-index: 12;

			display: flex;
			flex-direction: column;
			gap: 15px;
			max-width: 500px;

			padding: 20px;
			
			background-color: #242424;
			border-radius: 8px;
			border: 1px solid #424242;

			transition:
				transform 120ms ease-out;

			.header {
				font-size: 18px;
				font-weight: 500;
			}

			.description {
				font-size: 14px;
				line-height: 1.4;
			}

			.actions {
				display: flex;
				flex-direction: row;
				gap: 15px;
			}
		}
	}
</style>