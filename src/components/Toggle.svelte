<script lang="ts">
	import { createEventDispatcher } from "svelte";
	export let value = false;

	const dispatch = createEventDispatcher<{ toggled: boolean }>();

	$: {
		dispatch("toggled", value);
	}
</script>

<label class="switch">
	<input type="checkbox" bind:checked={value} />
	<span class="slider" />
</label>

<style lang="scss">
	.switch {
		position: relative;
		display: inline-block;
		width: calc(60px / 2);
		height: calc(34px / 2);

		input {
			opacity: 0;
			width: 0;
			height: 0;

			&:checked + .slider {
				background-color: #2196f3;
			}

			&:focus + .slider {
				box-shadow: 0 0 1px #2196f3;
			}

			&:checked + .slider:before {
				transform: translateX(calc(26px / 2));
			}
		}

		.slider {
			position: absolute;
			cursor: pointer;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: #ccc;
			transition: 200ms;
			border-radius: calc(34px / 2);

			&:before {
				position: absolute;
				content: "";
				height: calc(26px / 2);
				width: calc(26px / 2);
				left: calc(4px / 2);
				bottom: calc(4px / 2);
				background-color: white;
				transition: 200ms;
				border-radius: 50%;
			}
		}
	}
</style>
