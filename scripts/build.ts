import { build } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const counts: Record<string, number> = {};

function incr(name: string) {
	if (!counts[name]) {
		counts[name] = 0;
	}
	counts[name] += 1;
	return counts[name];
}

async function buildRelease() {
	// Optimized primarily for speed, and size second
	await build({
		mode: "release",
		plugins: [
			svelte({
				preprocess: vitePreprocess(),
				compilerOptions: {
					dev: false,
					hmr: false, // We are not using hot reload
					preserveComments: false,
					preserveWhitespace: false,
					enableSourcemap: false,
					hydratable: false,
					customElement: false,
					discloseVersion: true,
					modernAst: true,
					runes: true,
					cssHash: ({ name }) => `${name}-${incr(name)}`,
				}
			}),
		],
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern" // suppress sass 2.0 deprecation warning spam
				}
			}
		},
		build: {
			target: "esnext",
			outDir: "./dist/extension",
			minify: "terser",
			cssMinify: "lightningcss",
			rollupOptions: {
				input: {
					index: "src/main.ts",
					service_worker: "src/service-worker.ts"
				},
				treeshake: "smallest"
			},
			terserOptions: {
				compress: {
					global_defs: [],

					passes: 100, // I can wait
					ecma: 2020,
					sequences: 200,
					inline: 3,

					top_retain: null,

					pure_getters: "strict",
					toplevel: true,

					hoist_vars: true,
					hoist_funs: true,
					hoist_props: true,

					dead_code: true,
					conditionals: true,
					comparisons: true,
					loops: true,
					keep_infinity: true,
					module: true,
					drop_console: true,
					drop_debugger: true,
					evaluate: true,
					if_return: true,
					reduce_vars: true,
					reduce_funcs: true,
					side_effects: true,
					switches: true,
					typeofs: true,
					collapse_vars: true,
					directives: true,
					arrows: true,
					unused: true,
					booleans: true,
					computed_props: true,
					negate_iife: true,
					properties: true,
					keep_fargs: true, // I can guarantee this, but idk about Svelte tho
					keep_fnames: false,
					keep_classnames: false,

					// i am not sure if this turns stuff into var, because let and const are better for perf
					join_vars: true,

					booleans_as_integers: false,
					arguments: false,
					expression: false,
					pure_new: false, // I can guarantee this, but idk about Svelte tho

					unsafe: false,
					unsafe_arrows: false,
					unsafe_comps: false,
					unsafe_Function: false,
					unsafe_math: false, // breaks the code completely, I assume it is because it messes up BigInt stuff
					unsafe_methods: false,
					unsafe_proto: false,
					unsafe_regexp: false,
					unsafe_symbols: false,
					unsafe_undefined: false,

					ie8: false
				},
				mangle: {
					eval: false,
					keep_classnames: false,
					keep_fnames: false,
					module: true,
					reserved: [],
					toplevel: true,
					safari10: false
				},
				parse: {
					html5_comments: false,
					bare_returns: false,
					shebang: false
				},
				ecma: 2020,
				safari10: false,
				ie8: false,
				keep_fnames: false,
				keep_classnames: false,
				maxWorkers: 1,
				toplevel: true,
				module: true,
				format: {
					comments: false,
				},
				sourceMap: false,
			}
		},
		publicDir: "res",
	
		// Vite will try to use config file, which will cause plugins to run twice and error
		// therefore we need to tell Vite to not use any config file
		configFile: false,
	
		// We don't want to use any env file
		envFile: false
	});
}

async function buildDebug() {
	// Optimized for debugging
	await build({
		mode: "debug",
		plugins: [
			svelte({
				preprocess: vitePreprocess(),
				compilerOptions: {
					// dev: true, // vite-plugin-svelte is forcing this to false, so i dunno what to do
					hmr: false, // We are not using hot reload
					preserveComments: true,
					preserveWhitespace: true,
					enableSourcemap: true,
					hydratable: false,
					customElement: false,
					discloseVersion: true,
					modernAst: true,
					runes: true,
					cssHash: ({ name }) => `${name}-${incr(name)}`,
				}
			}),
		],
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern" // suppress sass 2.0 deprecation warning spam
				}
			}
		},
		build: {
			target: "esnext",
			outDir: "./dist/extension",
			emptyOutDir: true,
			minify: false,
			cssMinify: false,
			sourcemap: true,
			rollupOptions: {
				input: {
					index: "src/main.ts",
					service_worker: "src/service-worker.ts"
				},
				treeshake: false,
				maxParallelFileOps: 1000,
				cache: true,
			},
		},
		publicDir: "res",
	
		// Vite will try to use config file, which will cause plugins to run twice and error
		// therefore we need to tell Vite to not use any config file
		configFile: false,
	
		// We don't want to use any env file
		envFile: false
	});
}

const profile = Bun.argv[2];

if (!profile || profile.trim() === "" || !profile.startsWith("--")) {
	throw "Must provide a profile flag like '--release' or '--debug'";
} else if (profile === "--release") {
	await buildRelease();
} else if (profile === "--debug") {
	await buildDebug();
} else {
	throw `'${profile.substring(2)}' is not a supported profile; valid profiles are 'release' and 'debug'`;
}

await import("./transform");
