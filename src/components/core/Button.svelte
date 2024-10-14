<script lang="ts">
	
</script>

<button class="btn">Hello World</button>

<style lang="scss">
	@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

	:root {
		font-family: "Inter", sans-serif;
		box-sizing: border-box;
		line-height: 1;
		font-weight: 400;
	}

	.btn {
		contain: strict;

		all: unset;

		box-shadow:
			0px 0px 0px 0.5px rgba(0, 0, 0, 0.1),
			inset 0 0 1px rgba(255, 255, 255, 0.1),
			inset 0 1px 1px rgba(255, 255, 255, 0.1);
		
		background-clip: padding-box;
		// background-color: #313131;
		background-image: linear-gradient(#313131, #2b2b2b);
		padding: 10px 12px;
		text-shadow: 0 0 12px rgb(0, 0, 0);
		// filter: drop-shadow(0 0 1px crimson);
		// border: 1px solid rgb(229, 231, 235);
		border-radius: 6px;
		color: #fff;
		font-size: 14px;
		user-select: none;

		// &:hover {
			// border: 1px solid rgb(229, 231, 235);
		// }
	}
</style>
