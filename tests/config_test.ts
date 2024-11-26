import { TMDB } from "npm:tmdb-ts";
import { loadConfig } from "../utils/loadConfig.ts";
import { assertEquals, AssertionError, assertNotEquals } from "jsr:@std/assert";
import { testDirectory, testFile } from "./utils/files.ts";

Deno.test("Query show name, and getting response", async () => {
	const config = loadConfig();

	if (config !== null && config.tmdb_key !== null) {
		const tmdb = new TMDB(config.tmdb_key);
		const search = await tmdb.search.tvShows({ query: "Rick and morty" });

		assertNotEquals(search, null);
		assertEquals(search.page, 1);
		assertEquals(typeof search.results, "object");
	} else {
		assertEquals("Could not load config or tmdb api key is empty", "");
	}
});

Deno.test("Testing if directories exists", async (t) => {
	const config = loadConfig();

	if (!config) {
		throw new AssertionError("Could not load the config file");
	}

	await testDirectory(t, "show_folder", config.show_folder);
	await testFile(t, "database", config.database);
});

Deno.test("Testing if updateFreq is correct", () => {
	const config = loadConfig();
	if (!config) {
		throw new AssertionError("Could not load a config file");
	}

	if (!config.update_freq) {
		throw new AssertionError("update_freq does not exist or is empty in the config");
	}

	const hoursFreq = parseInt(config.update_freq.toString());
	assertEquals(typeof hoursFreq, "number");
});
