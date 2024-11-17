import { loadConfig } from "./utils/loadConfig.ts";
import { TMDB } from "npm:tmdb-ts";
// Load config file
const config = loadConfig();
if (config?.tmdb_key) {
	const tmdb = new TMDB(config.tmdb_key);
	const query = await tmdb.search.tvShows({ query: "rick and morty", year: undefined });

	console.log(query);
}
