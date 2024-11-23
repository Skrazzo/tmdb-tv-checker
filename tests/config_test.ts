import { TMDB } from "npm:tmdb-ts";
import { loadConfig } from "../utils/loadConfig.ts";
import { assertEquals, assertNotEquals, fail } from "jsr:@std/assert";
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

	if(!config) {
		fail("Could not load the config file");
	}

	await testDirectory(t, 'show_folder', config.show_folder);
	await testFile(t, 'database', config.database);

});
