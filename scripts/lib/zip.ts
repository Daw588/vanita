import childProcess from "node:child_process";

export function zip(inputPath: string, outputPath: string) {
	if (process.platform == "win32") {
		childProcess.exec(`Compress-Archive ${inputPath} ${outputPath}`, {
			"shell":"powershell.exe"
		});
	} else {
		throw "Platform not supported";
	}
}
