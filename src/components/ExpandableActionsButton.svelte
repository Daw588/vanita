<script lang="ts">
	import SquareButton from "./SquareButton.svelte";

	type Action = {
		icon: string,
		label: string,
		dangerous: boolean,
		onTriggered?: () => void
	}

	let expanded = false;
	export let actions: Action[] = [];
	export let direction: "up" | "down";

	let root: HTMLDivElement;

	function toggle() {
		expanded = !expanded;
	}

	function actionClicked(action: Action) {
		expanded = false;
		action.onTriggered?.();
	}

	function onClicked(event: MouseEvent) { 
		if (!root.contains(event.target as any)){
			// Clicked outside the div
			expanded = false;
		}
	}

	$: {
		if (expanded) {
			window.addEventListener("click", onClicked);
		} else {
			window.removeEventListener("click", onClicked);
		}
	}
</script>

<div class="root" bind:this={root}>
	<div class="actions" data-expanded={expanded} data-direction={direction}>
		{#each actions as action}
			<button class="action" on:click={() => actionClicked(action)} data-dangerous={action.dangerous}>
				<div class="icon">
					<span class="material-symbols-rounded">{action.icon}</span>
				</div>
				<div class="label">{action.label}</div>
			</button>
		{/each}
	</div>
	<div class="button">
		<SquareButton icon={expanded ? "close" : "more_vert"} on:click={toggle} />
	</div>
</div>

<style lang="scss">
	.root {
		position: relative;

		.actions {
			position: absolute;

			min-width: 200px;

			display: flex;
			flex-direction: column;
			gap: 3px;
			padding: 3px;
			z-index: 6;

			background-color: #171717;
			border-radius: 8px;
			border: 1px solid #4b4b4b;

			transition:
				opacity 100ms ease,
				visibility 100ms ease;

			&[data-expanded=true] {
				visibility: visible;
				opacity: 1;
			}

			&[data-expanded=false] {
				visibility: collapse;
				opacity: 0;
			}

			&[data-direction=up] {
				top: 0;
				right: 0;
				transform: translateY(calc(-100% - 5px));
			}

			&[data-direction=down] {
				bottom: 0;
				right: 0;
				transform: translateY(calc(100% + 5px));
			}

			.action {
				all: unset;

				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 8px;
				flex-grow: 1;

				padding: 8px;
				border-radius: 4px;
				cursor: pointer;

				&:hover {
					background-color: rgba(255, 255, 255, 0.1);
				}

				&[data-dangerous=true] {
					color: #ee474a;
				}

				.icon {
					display: flex;
					height: 18px;

					span {
						font-size: 18px;
					}
				}

				.label {
					font-size: 14px;
					flex-grow: 1;
				}
			}
		}
	}
</style>