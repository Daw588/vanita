<script lang="ts">
	export let checked: boolean;

	function toggle() {
		checked = !checked;
	}
</script>

<div class="root" data-checked={checked}>
	<button class="button" on:click={toggle}>
		<div class="checkbox">
			<div class="icon">
				<span class="material-symbols-rounded">check</span>
			</div>
		</div>
	</button>
</div>

<style lang="scss">
	.root {
		display: flex;
		flex-direction: row;
		gap: 10px;

		.button:focus-visible > .checkbox {
			box-shadow: 0 0 3pt 2pt #679aff;
		}

		.button:hover > .checkbox {
			background-color: rgba(255, 255, 255, 0.05);
			border-color: #4b4b4b;
		}

		&[data-checked=true] {
			.icon {
				visibility: visible;
			}
		}

		&[data-checked=false] {
			.icon {
				visibility: hidden;
			}
		}

		.button {
			all: unset;

			display: flex;
			cursor: pointer;
		}

		.checkbox {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			width: 20px;
			height: 20px;
			border: 1px solid #3a3a3a;
			border-radius: 4px;

			.icon {
				display: flex;

				span {
					font-size: 20px;
				}
			}
		}
	}
</style>