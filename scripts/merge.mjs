import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

import fsExtra from "fs-extra";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const js = await fs.readFile(__dirname + "/../build/static/js/bundle.min.js", { encoding: "utf-8" });
const css = await fs.readFile(__dirname + "/../build/static/css/bundle.min.css", { encoding: "utf-8" });
const bundleJs = `let s=document.createElement("style");s.textContent=\`${css}\`;document.head.append(s);${js}`;

await fsExtra.emptyDir(__dirname + "/../build");
await fs.rmdir(__dirname + "/../build");

await fs.writeFile(__dirname + "/../extension/program.js", bundleJs, { encoding: "utf-8" });