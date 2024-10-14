import fs from "node:fs";
import archiver from "archiver";

export function zip(inputPath: string, outputPath: string): Promise<void> {
	const archive = archiver("zip", { zlib: { level: 9, memLevel: 9 }});
	const stream = fs.createWriteStream(outputPath);

	return new Promise((resolve, reject) => {
		archive
			.directory(inputPath, false)
			.on("error", err => reject(err))
			.pipe(stream);
		
		stream.on("close", () => resolve());

		archive.finalize();
	});
}
