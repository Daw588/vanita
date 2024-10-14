<script lang="ts">
	import SquareButton from "./core/SquareButton.svelte";

	type Props = {
		name: string,
		thumbnail: string,
		onWearOutfit?: () => void,
		onEditOutfit?: () => void
	}

	let { name, thumbnail, onWearOutfit, onEditOutfit }: Props = $props();
</script>

<div class="outfit">
	<img
		class="thumbnail"
		src={thumbnail}
		alt="Thumbnail of {name} outfit" />
	
	<span class="tooltip">{name}</span>
	<button class="outfit-button" onclick={onWearOutfit} aria-label="Wear outfit"></button>
	<div class="configure">
		<SquareButton icon="edit" onClick={onEditOutfit} />
	</div>
</div>

<style lang="scss">
	@keyframes popout {
		from { transform: scale(0) }
		80% { transform: scale(1.1) }
		to { transform: scale(1) }
	}

	// @keyframes shake {
	// 	0% { transform: translate(1px, 1px) rotate(0deg); }
	// 	10% { transform: translate(-1px, -2px) rotate(-1deg); }
	// 	20% { transform: translate(-3px, 0px) rotate(1deg); }
	// 	30% { transform: translate(3px, 2px) rotate(0deg); }
	// 	40% { transform: translate(1px, -1px) rotate(1deg); }
	// 	50% { transform: translate(-1px, 2px) rotate(-1deg); }
	// 	60% { transform: translate(-3px, 1px) rotate(0deg); }
	// 	70% { transform: translate(3px, 1px) rotate(-1deg); }
	// 	80% { transform: translate(-1px, -1px) rotate(1deg); }
	// 	90% { transform: translate(1px, 2px) rotate(0deg); }
	// 	100% { transform: translate(1px, -2px) rotate(-1deg); }
	// }

	.outfit {
		// --thumbnail-size: 125px;

		width: var(--thumbnail-size);
		height: var(--thumbnail-size);

		position: relative;
		border-radius: 8px;
		// content-visibility: auto;
		// contain: strict;

		.tooltip {
			position: absolute;
			bottom: 0;
			left: 0;
			margin: 4px;
			padding: 4px;
			padding-left: 6px;
			padding-right: 6px;
			background-color: rgba(255, 255, 255, 0.1);
			backdrop-filter: blur(15px);
			border-radius: 4px;
			font-size: 12px;
			opacity: 0;
			transition: opacity 100ms ease;
			text-wrap: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			max-width: calc(var(--thumbnail-size) - (4px * 2));
			z-index: 1;
		}

		.configure {
			position: absolute;
			right: 0;
			top: 0;
			margin: 4px;
			// opacity: 0;
			visibility: hidden;
			z-index: 4;
		}

		.outfit-button {
			all: unset;

			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 2;
		}

		&:hover, &:has(.outfit-button:focus-visible) {
			.configure {
				// opacity: 1;
				visibility: visible;
				animation: popout 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
			}
		}

		&:has(.outfit-button:focus-visible) {
			box-shadow: 0 0 3pt 2pt #679aff;
		}

		&:has(.outfit-button:hover), &:has(.outfit-button:focus-visible) {
			.tooltip {
				opacity: 1;
				animation: popout 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
			}

			.thumbnail {
				// animation: shake 90ms ease;
				background: radial-gradient(transparent, rgba(255, 255, 255, 0.01));
				filter: drop-shadow(0 0 0.25rem rgba(255, 255, 255, 0.3));
			}
		}

		.thumbnail {
			// background-color: #2f3133;
			border-radius: 8px;
			transition: background 300ms linear;
			border: 1px solid #3a3a3a;
			width: var(--thumbnail-size);
			height: var(--thumbnail-size);
			transition:
				filter 100ms ease,
				background-color 50ms ease;
		}

		display: flex;
		flex-direction: column;
		// cursor: pointer;
	}
</style>
