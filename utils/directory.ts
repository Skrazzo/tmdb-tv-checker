export function isDirectory(path: string): boolean {
	try {
		const stat = Deno.statSync(path);
		if (stat.isDirectory) return true;
		return false;
	} catch (_err) {
		return false;
	}
}
