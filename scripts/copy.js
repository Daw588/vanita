import fs from "node:fs/promises";
import clipboard from "clipboardy";

const relaseJs = await fs.readFile("extension/embedded.js", { encoding: "utf-8" });
await clipboard.write(relaseJs);