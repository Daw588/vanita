<script lang="ts">
	export let checked: boolean;
</script>

<label class="switch">
	<input type="checkbox" bind:checked={checked}>
	<span class="slider"></span>
</label>

<style lang="scss">
	.switch {
		--button-width: 3.5em;
		--button-height: 2em;
		--toggle-diameter: 1.5em;
		--button-toggle-offset: calc((var(--button-height) - var(--toggle-diameter)) / 2);
		--toggle-shadow-offset: 10px;
		--color-grey: #3a3a3a;
		--color-green: #2866df;

		cursor: pointer;
	}

	.slider {
		display: inline-block;
		width: var(--button-width);
		height: var(--button-height);
		background-color: var(--color-grey);
		border-radius: calc(var(--button-height) / 2);
		position: relative;
		transition: all 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.slider::after {
		content: "";
		display: inline-block;
		width: var(--toggle-diameter);
		height: var(--toggle-diameter);
		background-color: #fff;
		border-radius: calc(var(--toggle-diameter) / 2);
		position: absolute;
		top: var(--button-toggle-offset);
		transform: translateX(var(--button-toggle-offset));
		box-shadow: var(--toggle-shadow-offset) 0 calc(var(--toggle-shadow-offset) * 4) rgba(0, 0, 0, 0.1);
		transition: all 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.switch input[type=checkbox]:checked + .slider {
		background-color: var(--color-green);
	}

	.switch input[type=checkbox]:checked + .slider::after {
		transform: translateX(calc(var(--button-width) - var(--toggle-diameter) - var(--button-toggle-offset)));
		box-shadow: calc(var(--toggle-shadow-offset) * -1) 0 calc(var(--toggle-shadow-offset) * 4) rgba(0, 0, 0, 0.1);
	}

	.switch input[type=checkbox] {
		display: none;
	}
</style>