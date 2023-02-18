import fs from "node:fs/promises";
import clipboard from "clipboardy";

const relaseJs = await fs.readFile("dist/release.js", { encoding: "utf-8" });
await clipboard.write(relaseJs);