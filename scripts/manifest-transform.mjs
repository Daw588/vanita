import fs from "fs/promises";

const BUILD_FOLDER = "extension";

const data = await fs.readFile(BUILD_FOLDER + "/manifest.json", { encoding: "utf-8" });
const obj = JSON.parse(data);

delete obj["$schema"]; // Chrome doesn't like $schema for some reason, gotta remove it

// JSON.stringify will also "minify" our manifest file, so that's cool
await fs.writeFile(BUILD_FOLDER + "/manifest.json", JSON.stringify(obj), { encoding: "utf-8" });
