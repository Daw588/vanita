<script lang="ts">
	import CircularProgressBar from "./core/CircularProgressBar.svelte";

	type Data = {
		/**
		 * Thumbnail of the outfit.
		 */
		thumbnail: string,

		/**
		 * Name of the outfit.
		 */
		name: string,

		/**
		 * Message that will be shown to the user.
		 */
		message: string
	}

	type Props = {
		enabled: boolean,
		data: Data
	}

	let { enabled, data }: Props = $props();
</script>

<div class="loading" data-open={enabled}>
	<div class="outfit">
		<div class="thumbnail">
			<img class="main" src={data.thumbnail} alt="Loading avatar" />
			<img class="reflection" src={data.thumbnail} alt="Loading avatar" />
		</div>
		<div class="name">{data.name}</div>
	</div>
	<div class="progress">
		<CircularProgressBar />
		<div class="label">{data.message}</div>
	</div>
</div>

<style lang="scss">
	// data-open={bool} trait implementation

	.loading {
		&[data-open=true] {
			visibility: visible;
		}

		&[data-open=false] {
			display: none;
		}

		color: rgb(244, 67, 54);
	}

	.loading {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(5px);
		z-index: 6;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 25px;

		.outfit {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 15px;

			.thumbnail {
				position: relative;
				width: 250px;
				height: 250px;

				.reflection {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;

					-webkit-box-reflect:
						below -20px linear-gradient(to bottom, rgba(0, 0 , 0, 0) 70%, rgba(0, 0, 0, 0.2));
					
					z-index: 1;
				}

				.main {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;

					filter: drop-shadow(0 0 50px rgba(255, 255, 255, 0.5));
					z-index: 2;
				}
			}

			.name {
				font-size: 28px;
				font-weight: 700;
			}
		}

		.progress {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 15px;

			.label {
				font-size: 16px;
			}
		}
	}
</style>
