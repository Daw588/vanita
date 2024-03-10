import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(/*{
			compilerOptions: {
				cssHash: ({ hash, css }: any) => `svelte-${hash(css)}`
			}
		}*/)
	],
	build: {
		target: "esnext",
		outDir: "./dist/extension",
		minify: "esbuild",
		cssMinify: "lightningcss",
		rollupOptions: {
			input: {
				index: "src/main.ts",
				service_worker: "src/service-worker.ts"
			}
		}
	},
	publicDir: "res"
});
