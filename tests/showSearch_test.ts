import { assertEquals } from "jsr:@std/assert";

import { prepareTmdbQuery } from "../utils/shows.ts";

Deno.test("Renaming folders so that they're compatible with tmdb query", () => {
	assertEquals(prepareTmdbQuery("Rick and morty (2013)").query, "rick and morty");
	assertEquals(prepareTmdbQuery("Rick and morty (2013)").year, 2013);
	assertEquals(prepareTmdbQuery("R()))ick a(nd )morty ()").query, 'rick and morty');
	assertEquals(prepareTmdbQuery("Rick and morty ()").year, undefined);
	assertEquals(prepareTmdbQuery("Rick and morty").query, "rick and morty");
	assertEquals(prepareTmdbQuery("Rick-and-morty").query, "rick and morty");
	assertEquals(prepareTmdbQuery("Rick_and_morty").query, "rick and morty");
	assertEquals(prepareTmdbQuery("Rick.and.morty").query, "rick and morty");
	assertEquals(prepareTmdbQuery("   Rick and Morty   ").query, "rick and morty"); // Leading/trailing spaces
	assertEquals(prepareTmdbQuery("RICK AND MORTY").query, "rick and morty"); // All uppercase
	assertEquals(prepareTmdbQuery("rick & morty").query, "rick and morty"); // Special character "&"
	assertEquals(prepareTmdbQuery("rick+and+morty").query, "rick and morty"); // "+" separator
	assertEquals(prepareTmdbQuery("rick@and#morty!").query, "rick and morty"); // Random special characters
	assertEquals(prepareTmdbQuery("Rick-and-Morty--2013").query, "rick and morty"); // Multiple dashes and year
	assertEquals(prepareTmdbQuery("Rick-and-Morty--2013").year, 2013); 
	assertEquals(prepareTmdbQuery("(Rick and Morty)").query, "rick and morty"); // Parentheses without year
	assertEquals(prepareTmdbQuery("(Rick and Morty)").year, undefined); // Parentheses without year
	assertEquals(prepareTmdbQuery("Breaking.Bad").query, "breaking bad"); // Different show format
	assertEquals(prepareTmdbQuery("The Witcher 2019").query, "the witcher");
	assertEquals(prepareTmdbQuery("The Witcher 2019").year, 2019);
	assertEquals(prepareTmdbQuery("No.Spe2024cial.Characters").query, "no special characters"); // Normal input with dots
	assertEquals(prepareTmdbQuery("No.Spe2024cial.Characters").year, 2024); // Normal input with dots
});
