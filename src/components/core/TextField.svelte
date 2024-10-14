<script lang="ts">
	type Props = {
		value: string,
		icon?: string,
		placeholder?: string,
		maxLength?: number,
		autocomplete: boolean,
		suggestions: string[],
		onEnter?: (text: string) => void,
		onChange?: (text: string) => void
	}

	let { value = $bindable(), icon, placeholder, maxLength, autocomplete, suggestions, onEnter, onChange }: Props = $props();

	let focused = $state(false);
	let inputElement: HTMLInputElement;
	let rootElement: HTMLDivElement;

	/**
	 * -1 means that the user has not selected any suggestion, and the current value of the text field should be used on submission
	 */
	let suggestionFocusIndex = $state(-1);

	type HTMLEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLInputElement;
	}

	function focus() {
		focused = true;
	}

	function blur() {
		inputElement.blur(); // Lose focus
		focused = false;
	}

	/**
	 * Submit is triggered when user presses enter
	 */
	function submit() {
		// If autocomplete is enabled, set the current value to suggestion, and submit that
		if (autocomplete && suggestionFocusIndex !== -1 && suggestions[suggestionFocusIndex]) {
			value = suggestions[suggestionFocusIndex]!;
			suggestionFocusIndex = -1;
		}

		if (onEnter) {
			onEnter(value);
		}

		blur();
	}

	function onKeydown(event: HTMLEvent) {
		if (event.key === "Enter") {
			submit();
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			moveUpSuggestionFocus();
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			moveDownSuggestionFocus();
		}
	}

	function moveDownSuggestionFocus() {
		// Note: index 0 is top, index .length is bottom
		if (suggestionFocusIndex < suggestions.length) {
			suggestionFocusIndex++;
		}
	}

	function moveUpSuggestionFocus() {
		if (suggestionFocusIndex > -1) {
			suggestionFocusIndex--;
		}
	}

	async function acceptSuggestion(suggestion: string) {
		value = suggestion;
		submit();
	}

	function onChangeHandler() {
		// dispatch("change", value);
		if (onChange) {
			onChange(value);
		}
	}

	function onClicked(event: MouseEvent) { 
		if (!rootElement.contains(event.target as Node | null)){
			// Clicked outside the div
			focused = false;
		}
	}

	$effect(() => {
		if (focused) {
			window.addEventListener("mousedown", onClicked);
		} else {
			window.removeEventListener("mousedown", onClicked);
		}
	});

	$effect(() => {
		// Make sure that suggestionFocusIndex remains under the length of suggestions, while also accounting for the 0 based indexing (-1)
		// This may occur when less suggestions are given, and the cursor is at higher index than the new length of suggestions
		suggestionFocusIndex = Math.min(suggestionFocusIndex, suggestions.length - 1);
	});
</script>

<div class="root" bind:this={rootElement}>
	{#if icon}
		<div class="icon">
			<span class="material-symbols-rounded">{icon}</span>
		</div>
	{/if}

	<input
		class="input"
		type="text"
		placeholder={placeholder}
		maxlength={maxLength}
		onfocus={focus}
		onchange={onChangeHandler}
		onkeydown={onKeydown}
		bind:value={value}
		bind:this={inputElement} />

	{#if autocomplete}
		<div class="suggestions{suggestions.length > 0 && focused ? " visible" : ""}">
			{#each suggestions as suggestion, i}
				<button class="suggestion{i === suggestionFocusIndex ? " focused" : ""}" onclick={() => acceptSuggestion(suggestion)}>{suggestion}</button>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.root {
		position: relative;
		display: flex;
		flex-direction: row;
		gap: 5px;
		align-items: center;

		border: 1px solid #3a3a3a;
		border-radius: 4px;
		padding: 5px;
		margin: 0;

		.icon {
			display: flex;
			height: 18px;

			span {
				font-size: 18px;
				color: #e8e8e8;
			}
		}

		.input {
			all: unset;
			font-size: 14px;
			flex-grow: 1;
		}

		.suggestions {
			z-index: 5;

			display: none;
			position: absolute;
			bottom: -5px; // essentially margin-top
			left: 0;
			transform: translateY(100%);

			flex-direction: column;
			width: 100%;

			box-shadow: 8.0px 16.0px 16.0px hsl(0deg 0% 0% / 0.25); // Elevation
			background-color: #171717;
			border: 1px solid #4b4b4b;

			$border-radius: 4px;
			border-radius: $border-radius;

			&.visible {
				display: flex;
			}

			.suggestion {
				all: unset; // Remove button defaults

				font-size: 14px;
				padding: 6px;
				cursor: pointer;

				&:first-child {
					border-top-left-radius: $border-radius;
					border-top-right-radius: $border-radius;
				}

				&:last-child {
					border-bottom-left-radius: $border-radius;
					border-bottom-right-radius: $border-radius;
				}

				&:hover, &.focused {
					background-color: rgba(255, 255, 255, 0.05);
					border-color: #4b4b4b;
				}
			}
		}
	}
</style>
