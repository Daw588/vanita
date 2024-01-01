import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(),
		createHtmlPlugin({
			minify: true
		})
	],
	build: {
		target: "esnext",
		outDir: "extension"
	},
	publicDir: "res"
});
