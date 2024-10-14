import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
	preprocess: vitePreprocess({
		style: {
			css: {
				preprocessorOptions: {
					scss: {
						api: "modern" // suppress sass 2.0 deprecation warning spam
					}
				}
			}
		}
	}),
	compilerOptions: {
		runes: true
	}
};
