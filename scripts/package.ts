import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { zip } from "./lib/zip.js";

const IN_FOLDER = "dist/extension";
const OUT_FOLDER = "dist";

const manifestPath = path.join(IN_FOLDER, "manifest.json");

if (!(await fsp.exists(manifestPath))) {
	throw "Missing 'manifest.json' file";
}

const manifest = JSON.parse(await fsp.readFile(manifestPath, { encoding: "utf-8" }));

const files = await fsp.readdir(IN_FOLDER, { recursive: true });
const debugBuild = files.find(v => v.endsWith(".map"));

const buildType = debugBuild ? "debug" : "release";
const buildVersion = manifest["version"];

const tempPath = path.join(os.tmpdir(), "out.zip");

if (fs.existsSync(tempPath)) {
	await fsp.unlink(tempPath);
}

zip(IN_FOLDER, tempPath);

const archiveBuffer = await Bun.file(tempPath).arrayBuffer();

const cryptoHasher = new Bun.CryptoHasher("md5"); // Hash doesn't have to be secure (this isn't intended for integrity)
cryptoHasher.update(archiveBuffer, "binary");

const buildHash = cryptoHasher.digest("hex").substring(0, 8); // We want a very short hash

await fsp.rename(tempPath, path.join(OUT_FOLDER, `vanita-${buildType}-${buildVersion}-${buildHash}.zip`));
