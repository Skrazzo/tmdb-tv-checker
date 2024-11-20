import { assertEquals, fail } from "@std/assert";
import { Path } from "jsr:@david/path";
import { loadConfig } from "../utils/loadConfig.ts";

Deno.test("Testing David path library", () => {
	const config = loadConfig();
	if (!config || !config.show_folder) {
		fail("Config file is not correct");
	}

	const showPath = new Path(config.show_folder);
	const testPath = showPath.join("tmp-test");

	assertEquals(showPath.toString(), config.show_folder);

	if (testPath.existsSync()) testPath.removeSync();

	// Test path does not exist
	assertEquals(testPath.existsSync(), false);

	// Create test path
	testPath.mkdirSync();
	assertEquals(testPath.existsSync(), true);
	testPath.removeSync();
	assertEquals(testPath.existsSync(), false);
});
