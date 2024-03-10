import { zip } from "./lib/zip.js";
import fs from "node:fs";
import fsp from "node:fs/promises";

const BUILD_FOLDER = "./dist";

if (fs.existsSync(BUILD_FOLDER + "/extension.zip")) {
	await fsp.unlink(BUILD_FOLDER + "/extension.zip");
}

zip(BUILD_FOLDER + "/extension", BUILD_FOLDER + "/extension.zip");