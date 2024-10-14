import fs from "node:fs/promises";
import path from "node:path";
import minifyHtml from "@minify-html/node";
import { HTMLElement, parse as parseHTML } from "node-html-parser";

type File = {
	path: string,
	name: string,
	ext: string
}

const BUILD_FOLDER = "./dist/extension";
const HTML_ENTRY = "./src/index.html";

const data = await fs.readFile(`${BUILD_FOLDER}/manifest.json`, { encoding: "utf-8" });
const manifest = JSON.parse(data);

// delete manifest["$schema"]; // Chrome doesn't like $schema for some reason, gotta remove it
manifest["$schema"] = undefined; // Chrome doesn't like $schema for some reason, gotta remove it

async function getBundledAssets() {
	const files: File[] = [];
	for (const assetName of await fs.readdir(`${BUILD_FOLDER}/assets`)) {
		const parsed = path.parse(assetName);
		files.push({
			path: `${BUILD_FOLDER}/assets/${assetName}`,
			name: parsed.name,
			ext: parsed.ext
		});
	}
	return files;
}

const bundledAssets = await getBundledAssets();

const indexJs = bundledAssets.find(v => v.ext === ".js" && v.name.startsWith("index"));
const indexCss = bundledAssets.find(v => v.ext === ".css" && v.name.startsWith("index"));
const serviceWorkerJs = bundledAssets.find(v => v.ext === ".js" && v.name.startsWith("service_worker"));

if (!indexJs || !indexCss || !serviceWorkerJs) {
	throw "Could not locate 'index.js', 'index.css', or 'service_worker.js' in the build folder!";
}

const rawHtml = await fs.readFile(HTML_ENTRY, { encoding: "utf-8" });
const root = parseHTML(rawHtml);

// <script type="module" src="/assets/index-[hash].js"></script>
const indexScript = new HTMLElement("script", {});
indexScript.setAttributes({ type: "module", src: `./assets/${indexJs.name}${indexJs.ext}` });

// <link rel="stylesheet" crossorigin href="/assets/index-[hash].css">
const indexStyle = new HTMLElement("link", {});
indexStyle.setAttributes({ rel: "stylesheet", crossorigin: "anonymous", href: `./assets/${indexCss.name}${indexCss.ext}` });

const head = root.getElementsByTagName("head")[0]!;

head.appendChild(indexScript);
head.appendChild(indexStyle);

// console.debug(root.toString());

const minifiedHtml = minifyHtml.minify(Buffer.from(root.toString()), {
	do_not_minify_doctype: false,
	keep_comments: false,
	keep_ssi_comments: false,
	minify_css: false,
	minify_js: false,
	remove_bangs: true,
	remove_processing_instructions: true,
	keep_closing_tags: false,
	keep_html_and_head_opening_tags: true,
	keep_spaces_between_attributes: true,
	preserve_brace_template_syntax: false,
	preserve_chevron_percent_template_syntax: false,
	ensure_spec_compliant_unquoted_attribute_values: true
});

await fs.writeFile(`${BUILD_FOLDER}/index.html`, minifiedHtml);

// Register service_worker.js

// const viteConfig = await import("../vite.config");

// const input = viteConfig.default.build?.rollupOptions?.input;

// if (input && typeof(input) === "object" && !Array.isArray(input)) {
// 	const sourcePath = input["service_worker"];

// const sourcePath = "src/service-worker.ts";

// Locate bundled js
let outputPath: string | undefined;
for (const assetName of await fs.readdir(`${BUILD_FOLDER}/assets`)) {
	if (assetName.startsWith("service_worker")) {
		outputPath = assetName;
		break;
	}
}

if (outputPath) {
	const absoluteOutputPath = `${BUILD_FOLDER}/assets/${outputPath}`;
	manifest["background"]["service_worker"] = `./${path.relative(BUILD_FOLDER, absoluteOutputPath).replaceAll("\\", "/")}`;
	// console.debug(`Registered "${outputPath}" from "${sourcePath}" as a service worker`);
}

// JSON.stringify will also "minify" our manifest file, so that's cool
await fs.writeFile(`${BUILD_FOLDER}/manifest.json`, JSON.stringify(manifest), { encoding: "utf-8" });
