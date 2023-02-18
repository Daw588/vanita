import fs from "node:fs/promises";
import fsExtra from "fs-extra";
import path from "node:path";
import uglify from "uglify-js";

/**
 * Finds file with desired extension in a given directory.
 * @param {string} directoryPath Directory to look for the file
 * @param {string} extension What file extension to look for
 * @returns Path to file that has desired extension
 */
async function getFilePathByExtension(directoryPath, extension) {
	const fileNames = await fs.readdir(directoryPath);
	for (const fileName of fileNames) {
		if (fileName.includes(extension)) {
			return path.join(directoryPath, fileName);
		}
	}
}

// Paths to files needed to be packed
const loaderJsPath = "loader.js";
const indexJsPath = await getFilePathByExtension("dist/assets", ".js");
const indexCssPath = await getFilePathByExtension("dist/assets", ".css");

// Get raw contents
let loaderJsRaw = await fs.readFile(loaderJsPath, { encoding: "utf-8" });
const indexJsRaw = await fs.readFile(indexJsPath, { encoding: "utf-8" });
const indexCssMin = await fs.readFile(indexCssPath, { encoding: "utf-8" });

// Inject CSS into loader code
loaderJsRaw = loaderJsRaw.replace("%CSS%", indexCssMin.trimEnd());

// Compress contents
const loaderJsMin = uglify.minify(loaderJsRaw).code;
const indexJsMin = uglify.minify(indexJsRaw).code;

/*
	Combine two files, and isolate index.js
	code environment to prevent breaking site's code.

	We can isolate it with (() => )();
	
	We are basically creating an anonymous arrow function
	and calling it, this wraps code within that function
	and, therefore, scopes everything to it instead of spilling
	everything into the global environment which will interfere
	with site's code.
*/
const finalCode = loaderJsMin + `(()=>{${indexJsMin}})()`;

await fsExtra.emptyDir("dist");
await fs.writeFile("dist/release.js", finalCode, { encoding: "utf-8" });

// Create one for extension as well
await fs.writeFile("extension/embedded.js", finalCode, { encoding: "utf-8" })