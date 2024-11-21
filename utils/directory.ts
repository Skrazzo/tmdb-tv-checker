import { Path } from "jsr:@david/path";
import { videoExtensions } from "../variables/var.ts";

export function getDirs(path: Path): Path[] | null {
	const dir = new Path(path);
	if (!dir.existsSync()) return null;
	const contents = dir.readDirSync();

	const rtn: Path[] = [];
	for (const c of contents) {
		if (c.isDirectory) {
			rtn.push(c.path);
		}
	}

	return rtn;
}

export function getVideoFiles(path: Path): Path[] | null {
	if (!path.existsSync()) return null;
	const contents = path.readDirSync();

	const rtn: Path[] = [];
	for (const c of contents) {
		if (c.isFile) {
			const fileExt: string | undefined = c.path.extname();
			if (!fileExt) continue;

			if (videoExtensions.includes(fileExt)) {
				rtn.push(c.path);
			}
		}
	}

	return rtn;
}
