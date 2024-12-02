import { assertEquals } from "jsr:@std/assert";
import { getEpisode, getSeason, prepareTmdbQuery } from "../utils/shows.ts";

Deno.test("Renaming folders so that they're compatible with tmdb query", () => {
	assertEquals(prepareTmdbQuery("Rick and morty (2013)").query, "rick and morty");
	assertEquals(prepareTmdbQuery("Rick and morty (2013)").year, 2013);
	assertEquals(prepareTmdbQuery("R()))ick a(nd )morty ()").query, "rick and morty");
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
	assertEquals(prepareTmdbQuery("Breaking.Bad.---2024").query, "breaking bad");
	assertEquals(prepareTmdbQuery("Breaking---.Bad.-2024").year, 2024);
	assertEquals(prepareTmdbQuery("The Witcher 2019").query, "the witcher");
	assertEquals(prepareTmdbQuery("The Witcher 2019").year, 2019);
	assertEquals(prepareTmdbQuery("No.Spe2024cial.Characters").query, "no special characters"); // Normal input with dots
	assertEquals(prepareTmdbQuery("No.Spe2024cial.Characters").year, 2024); // Normal input with dots
});

Deno.test("Season number extraction", async (t) => {
	await t.step("extracts basic season numbers", () => {
		assertEquals(getSeason("S01"), 1);
		assertEquals(getSeason("S1"), 1);
		assertEquals(getSeason("S10"), 10);
	});

	await t.step("handles different formats", () => {
		assertEquals(getSeason("Season 01"), 1);
		assertEquals(getSeason("SEASON01"), 1);
		assertEquals(getSeason("season1"), 1);
	});

	await t.step("handles edge cases", () => {
		assertEquals(getSeason("S00"), 0);
		assertEquals(getSeason("S99"), 99);
		assertEquals(getSeason(" S01 "), 1);
	});

	await t.step("throws error for invalid inputs", () => {
		assertEquals(getSeason(""), null);
		assertEquals(getSeason("S"), null);
		assertEquals(getSeason("01"), 1);
		assertEquals(getSeason("SA1"), 1);
	});
});

Deno.test("Episode number extraction", async (t) => {
	await t.step("extracts episode numbers from standard format", () => {
		assertEquals(getEpisode("Silo.S02E01.720p.HEVC.x265-MeGusta[EZTVx.to].mkv"), 1);
		assertEquals(getEpisode("Show.S01E23.1080p.WEB.x264.mkv"), 23);
		assertEquals(getEpisode("Series.S05E09.HDR.2160p.WEB.H265.mkv"), 9);
		assertEquals(getEpisode("The_EXPANSE_S02_E13_Calibans_War_(720p_AMZN_WebRip).mp4"), 13);
		assertEquals(getEpisode('The_EXPANSE_S02_E09_The_Weeping_Somnambulist_(720p_AMZN_WebRip).mp4'), 9);
	});

	await t.step("handles different separators and formats", () => {
		assertEquals(getEpisode("Show.S01xE01.mkv"), 1);
		assertEquals(getEpisode("Show.1x01.mkv"), 1);
		assertEquals(getEpisode("Show.S01.E01.mkv"), 1);
		assertEquals(getEpisode("Show_S01E01_1080p.mkv"), 1);
	});

	await t.step("handles missing or invalid formats", () => {
		assertEquals(getEpisode("Show.mkv"), null);
		assertEquals(getEpisode("Show.S01.mkv"), null);
		assertEquals(getEpisode("Show.E01.mkv"), 1);
		assertEquals(getEpisode("Show.S01EXX.mkv"), null);
	});

	await t.step("handles special cases", () => {
		assertEquals(getEpisode("Show.S01E00.Pilot.mkv"), 0);
		assertEquals(getEpisode("show.s01e01.mkv"), 1);
		assertEquals(getEpisode("SHOW.S01E01.MKV"), 1);
	});

	await t.step("handles double-digit episodes", () => {
		assertEquals(getEpisode("Show.S01E10.mkv"), 10);
		assertEquals(getEpisode("Show.S02E15.mkv"), 15);
		assertEquals(getEpisode("Show.S03E99.mkv"), 99);
	});

	await t.step("handles various file names and formats", () => {
		assertEquals(getEpisode("The.Walking.Dead.S03E07.720p.mkv"), 7);
		assertEquals(getEpisode("Breaking.Bad.S05E16.Felina.1080p.mkv"), 16);
		assertEquals(getEpisode("Friends.S02E05.The.One.with.Five.Steaks.mkv"), 5);
		assertEquals(getEpisode("Game.of.Thrones.S08E03.The.Long.Night.mkv"), 3);
		assertEquals(getEpisode("The.Walking.Dead.S03E07.720p.mkv"), 7);
		assertEquals(getEpisode("Scavengers Reign S01E011.mp4"), 11);
		
	});

	await t.step("handles atypical formats", () => {
		assertEquals(getEpisode("Show-S01E01-HDTV.mkv"), 1);
		assertEquals(getEpisode("Show.SE01EP02.mkv"), 2);
		assertEquals(getEpisode("Show-Season01Episode02.mkv"), 2);
		assertEquals(getEpisode("Show.S1E1.mkv"), 1);
	});
});
