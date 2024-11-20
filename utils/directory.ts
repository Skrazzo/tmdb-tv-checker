import { Path } from "jsr:@david/path";

export function getDirs(path: string): string[] | null {
	const dir = new Path(path);
	if (!dir.existsSync()) return null;
	const contents = dir.readDirSync();

	const rtn: string[] = [];
	for (const c of contents) {
		if (c.isDirectory) {
			rtn.push(c.name);
		}
	}

	return rtn;
}
