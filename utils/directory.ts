import { diffStr } from "jsr:@std/internal@^1.0.5/diff-str";
import { NotFoundError } from "../types/index.ts";

export function isDirectory(path: string): boolean {
	try {
		const stat = Deno.statSync(path);
		if (stat.isDirectory) return true;
		return false;
	} catch (_err) {
		return false;
	}
}

export function getDirs(path: string): string[] | NotFoundError {
	if (!isDirectory(path)) {
		throw new NotFoundError({ message: path, cause: "Directory not found when scanning for shows" });
	}

	const dirs: Iterable<Deno.DirEntry> = Deno.readDirSync(path);
	if (!dirs) return [];

	const rtnDirs: string[] = [];

	for (const dir of dirs) {
		if (dir.isFile) {
			rtnDirs.push(dir.name);
		}
	}

	return rtnDirs;
}
