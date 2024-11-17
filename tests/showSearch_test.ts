import { assertEquals } from "jsr:@std/assert";

import { prepareTmdbQuery } from "../utils/shows.ts";

Deno.test("Renaming folders so that they're compatible with tmdb query", () => {
	// TODO: Finish this hoe
	assertEquals(prepareTmdbQuery("Rick and morty (2013)"), "rick and morty");
	assertEquals(prepareTmdbQuery("Rick and morty"), "rick and morty");
});
