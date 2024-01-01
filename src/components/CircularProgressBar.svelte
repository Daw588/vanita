<div class="root">
	<div class="loader">
		<svg class="circular">
			<circle
				class="path"
				cx={50}
				cy={50}
				r={20}
				fill="none"
				stroke-width={5}
				stroke-miterlimit={"10"}></circle>
		</svg>
	</div>
</div>

<style lang="scss">
	$green: #008744;
	$blue: #0057e7;
	$red: #d62d20;
	$yellow: #ffa700;
	$white: #eee;

	$width: 100px;

	.root {
		position: relative;
		width: calc($width / 2);
		height: calc($width / 2);
	}

	.loader {
		position: absolute;
		width: $width;
		height: $width;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.circular {
		animation: rotate 2s linear infinite;
		height: $width;
		position: relative;
		width: $width;
	}

	.path {
		stroke-dasharray: 1, 200;
		stroke-dashoffset: 0;
		stroke: #b6463a;
		animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
		stroke-linecap: round;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}
	@keyframes dash {
		0% {
			stroke-dasharray: 1, 200;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 89, 200;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 89, 200;
			stroke-dashoffset: -124;
		}
	}
	@keyframes color {
		100%,
		0% {
			stroke: $red;
		}
		40% {
			stroke: $blue;
		}
		66% {
			stroke: $green;
		}
		80%,
		90% {
			stroke: $yellow;
		}
	}
</style>
