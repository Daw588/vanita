import fs from "node:fs/promises";
import fsExtra from "fs-extra";
import path from "node:path";
import uglify from "uglify-js";
import { zip } from "zip-a-folder";
import tsNode from "ts-node";

const tsNodeService = tsNode.create({
	/*
		This gets rid of the following error:
		TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"
	*/
	esm: true
});

/**
 * Finds file with desired extension in a given directory.
 * @param directoryPath Directory to look for the file
 * @param extension What file extension to look for
 * @returns Path to file that has desired extension
 */
async function getFilePathByExtension(directoryPath: string, extension: string) {
	const fileNames = await fs.readdir(directoryPath);
	for (const fileName of fileNames) {
		if (fileName.includes(extension)) {
			return path.join(directoryPath, fileName);
		}
	}
}

// Paths to files needed to be packed
const loaderTsPath = "scripts/pack/loader.ts";
const indexJsPath = await getFilePathByExtension("build/assets", ".js");
const indexCssPath = await getFilePathByExtension("build/assets", ".css");

// Get raw contents
const loaderTsRaw = await fs.readFile(loaderTsPath, { encoding: "utf-8" });
const indexJsRaw = await fs.readFile(indexJsPath, { encoding: "utf-8" });
const indexCssMin = await fs.readFile(indexCssPath, { encoding: "utf-8" });

// Compile loader from TypeScript to JavaScript
let loaderJsRaw = tsNodeService.compile(loaderTsRaw, "loader.js");

// Inject CSS into loader code
loaderJsRaw = loaderTsRaw.replace("%CSS%", indexCssMin.trimEnd());

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

await fsExtra.emptyDir("build");
await fs.writeFile("extension/embedded.js", finalCode, { encoding: "utf-8" });
await zip("extension", "build/release.zip");