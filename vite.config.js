import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createHtmlPlugin } from "vite-plugin-html";

let counter = 0;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: {
				cssHash: ({ hash, css, name, filename }) => {
					const className = "a" + counter;
					counter++;
					return className;
				}
			}
		}),
		createHtmlPlugin({
			minify: true
		})
	],
	server: {
		hmr: {
			port: 443,
		},
		port: 3000
	},
	build: {
		outDir: "build"
	}
});
