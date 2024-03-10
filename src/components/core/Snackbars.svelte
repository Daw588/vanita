<script lang="ts">
	import { instances, FADE_TIME } from "../../lib/snackbar";
</script>

<div class="root" style="--fade-time: {FADE_TIME}s">
	{#each $instances as instance (instance.id)}
		<div class="snackbar" style="--life-span: {instance.lifespan}s">
			<div class="body">{instance.message}</div>
		</div>
	{/each}
</div>

<style lang="scss">
	$opacity: 0.9;

	@keyframes slideIn {
		from { transform: translateY(100%) }
		to { transform: translateY(0px) }
	}

	@keyframes fade {
		from {
			opacity: $opacity;
			visibility: visible;
		}
		to {
			opacity: 0;
			visibility: collapse;
		}
	}

	.root {
		position: absolute;
		right: 0;
		bottom: 0;
		z-index: 10;
		width: 100%;
		height: 100%;
		pointer-events: none; // Let all pointer events pass through

		display: flex;
		flex-direction: column;
		align-items: end;
		justify-content: end;
		padding: 25px;
		gap: 5px;
		
		.snackbar {
			opacity: $opacity;

			animation:
				slideIn 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
				var(--fade-time) fade var(--life-span) ease forwards;
			
			.body {
				font-size: 14px;
				background-color: #242424;
				border-radius: 8px;
				border: 1px solid #424242;
				padding: 8px 12px;
				width: fit-content;
			}
		}
	}
</style>