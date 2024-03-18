<script lang="ts">
	import { createEventDispatcher } from "svelte";

	type Action = {
		label: string,
		icon: string,
		onActivated?: () => void
	}

	export let icon: string | null = null;
	export let label: string;
	export let kind: "normal" | "danger" = "normal";
	export let grow: boolean = false;

	// Split button stuff
	export let actions: Action[] = [];
	export let expanded = false;

	let containerDiv: HTMLDivElement;

	type Events = {
		click: void
	}

	const dispatch = createEventDispatcher<Events>();

	function onClick() {
		expanded = false;
		dispatch("click");
	}

	function onClicked(event: MouseEvent) { 
		if (!containerDiv.contains(event.target as any)){
			// Clicked outside the div
			expanded = false;
		}
	}

	function onActionActivated(action: Action) {
		expanded = false;
		action.onActivated?.();
	}

	$: {
		if (expanded) {
			window.addEventListener("mousedown", onClicked);
		} else {
			window.removeEventListener("mousedown", onClicked);
		}
	}
</script>

<div bind:this={containerDiv} class="root" data-kind={kind} data-grow={grow} data-expanded={expanded}>
	<button class="primary" on:click={onClick}>
		{#if icon}
			<div class="icon">
				<span class="material-symbols-rounded">{icon}</span>
			</div>
		{/if}
		<div class="label">{label}</div>
	</button>

	<!-- Split button stuff -->
	{#if actions.length > 0}
		<button class="secondary" on:click={() => expanded = !expanded}>
			<span class="icon material-symbols-rounded">arrow_drop_down</span>
		</button>

		<div class="tray">
			{#each actions as action}
				<button class="action" on:click={() => onActionActivated(action)}>
					<div class="icon">
						<span class="material-symbols-rounded">{action.icon}</span>
					</div>
					<div class="label">{action.label}</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.root {
		position: relative;
		display: flex;
		flex-direction: row;

		color: #ffffff;
		font-size: 13px;
		font-weight: 600;
		border-radius: 4px;

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

		.tray {
			position: absolute;
			top: calc(100% + 2px);
			left: 0;
			z-index: 6;

			width: 100%;
			min-width: 200px;

			display: flex;
			flex-direction: column;

			box-shadow: 8.0px 16.0px 16.0px hsl(0deg 0% 0% / 0.25); // Elevation
			background-color: #171717;
			border: 1px solid #4b4b4b;
			border-radius: 4px;
			
			transition:
				opacity 100ms ease,
				visibility 100ms ease;

			.action {
				all: unset;

				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 6px; // 8px
				flex-grow: 1;

				padding: 6px; // 8px
				border-radius: 4px;
				cursor: pointer;

				&:hover {
					background-color: rgba(255, 255, 255, 0.1);
				}

				// &[data-dangerous=true] {
				// 	color: #ee474a;
				// }

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

		&[data-expanded=true] {
			.tray {
				visibility: visible;
				opacity: 1;
			}

			.secondary {
				.icon {
					transform: rotate(180deg);
				}
			}
		}

		&[data-expanded=false] {
			.tray {
				visibility: collapse;
				opacity: 0;
			}
		}
	}

	.primary, .secondary {
		all: unset;

		&:focus {
			outline: revert;
		}
		
		background-color: var(--bg-color);
		min-height: calc(28px - 4px * 2);
		cursor: pointer;

		&:hover {
			background-color: var(--bg-color-hovered);
			// box-shadow: 0 1px 4px rgba(58, 58, 58, 0.5), 0 0 6px rgba(0, 0, 0, 0.5);
		}
	}

	.root:has(.secondary) {
		.primary {
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;
			border-right: 1px solid rgba(255, 255, 255, 0.1);
		}
	}

	.root:not(:has(.secondary)) {
		.primary {
			border-radius: 4px;
		}
	}

	.primary {
		padding: 4px 12px;
		flex-grow: 1;

		display: flex;
		flex-direction: row;
		gap: 5px;
		align-items: center;
		justify-content: center;

		.label {
			font-weight: 500;
		}

		.icon {
			display: flex;
			height: 18px;

			span {
				font-size: 18px;
			}
		}
	}

	.secondary {
		border-top-right-radius: 4px;
		border-bottom-right-radius: 4px;
		padding: 0 4px;

		.icon {
			transition: transform 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
		}
	}
</style>