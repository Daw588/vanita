<script lang="ts">
	import Dialog from "./Dialog.svelte";
	import PrimaryButton from "./PrimaryButton.svelte";

	type Action = {
		label: string,
		icon?: string,
		kind?: "positive" | "negative" | "neutral",
		onClick: () => void
	}

	type Props = {
		actions?: Action[],
		title: string,
		description: string,
		allowHTML?: boolean,
		visible: boolean,
		zIndex?: number,
		onDismiss?: () => void
	}

	let { actions = [], title, description, allowHTML = false, visible, zIndex, onDismiss }: Props = $props();
</script>

<Dialog open={visible} zIndex={zIndex} onDismiss={onDismiss}>
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
					onClick={action.onClick} />
			{/each}
		</div>
	</div>
</Dialog>

<style lang="scss">
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
</style>
