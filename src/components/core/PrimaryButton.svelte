<script lang="ts">
	type Action = {
		label: string,
		icon: string,
		onActivated?: () => void
	}

	type Props = {
		icon?: string,
		label: string,
		kind?: "positive" | "negative" | "neutral",
		grow?: boolean,

		onClick?: () => void,

		// Split button stuff
		actions?: Action[],
		expanded?: boolean
	}

	let { icon, label, kind = "positive", grow = false, actions = [], expanded = false, onClick }: Props = $props();

	let containerDiv: HTMLDivElement;

	function onInternalClick() {
		expanded = false;
		if (onClick) {
			onClick();
		}
	}

	function onClicked(event: MouseEvent) { 
		if (!containerDiv.contains(event.target as Node | null)){
			// Clicked outside the div
			expanded = false;
		}
	}

	function onActionActivated(action: Action) {
		expanded = false;
		action.onActivated?.();
	}

	$effect(() => {
		if (expanded) {
			window.addEventListener("mousedown", onClicked);
		} else {
			window.removeEventListener("mousedown", onClicked);
		}
	});
</script>

<div bind:this={containerDiv} class="root" data-kind={kind} data-grow={grow} data-expanded={expanded}>
	<button class="primary" onclick={onInternalClick}>
		{#if icon}
			<div class="icon">
				<span class="material-symbols-rounded">{icon}</span>
			</div>
		{/if}
		<div class="label">{label}</div>
	</button>

	<!-- Split button stuff -->
	{#if actions.length > 0}
		<button class="secondary" onclick={() => expanded = !expanded}>
			<span class="icon material-symbols-rounded">arrow_drop_down</span>
		</button>

		<div class="tray">
			{#each actions as action}
				<button class="action" onclick={() => onActionActivated(action)}>
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
	@use "sass:color";
	// @import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

	// :root, * {
	// 	font-family: "Inter", sans-serif;
	// 	box-sizing: border-box;
	// 	line-height: 1;
	// 	font-weight: 400;
	// }

	.root {
		position: relative;
		display: flex;
		flex-direction: row;

		color: #ffffff;
		font-size: 13px;
		font-weight: 600;
		border-radius: 4px;

		&[data-kind=positive] {
			--bg-color: #2866df;
			// --bg-color-hovered: #215ac8;
		}

		&[data-kind=negative] {
			--bg-color: #c72636;
			// --bg-color-hovered: #a82633;
		}

		&[data-kind=neutral] {
			--bg-color: #3a3a3a;
			// --bg-color-hovered: #313131;
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
				// cursor: pointer;

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
		border: 1px solid transparent;
		// cursor: pointer;

		&:hover {
			// background-color: var(--bg-color-hovered);
			border-color: color-mix(in srgb, var(--bg-color), white 20%);
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
