import { assertEquals, AssertionError } from "jsr:@std/assert";
import { Path } from "jsr:@david/path";

export const testDirectory = async (t: Deno.TestContext, dirName: string, path: string | null) => {
	await t.step(`${dirName} directory exists`, () => {
		if (path !== null) {
			const pathInstance = new Path(path);
			assertEquals(pathInstance.existsSync(), true);
		} else {
			throw new AssertionError(`${dirName} path is empty or non existent`);
		}
	});
};

export const testFile = async (t: Deno.TestContext, fileName: string, path: string | null) => {
	await t.step(`${fileName} file exists and is accesible`, () => {
		if (path !== null) {
			// Check if file exists
			const pathInstance: Path = new Path(path);
			assertEquals(pathInstance.existsSync(), true);

			// Check if it is accesible
			const stat: Deno.FileInfo = Deno.statSync(pathInstance.toString());
			assertEquals(stat.isFile, true);
		} else {
			throw new AssertionError(`${fileName} file is empty or non existent`);
		}
	});
};
