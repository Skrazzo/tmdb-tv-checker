import { isDirectory } from "./utils/directory.ts";
import { displayError } from "./utils/errors.ts";
import { loadConfig } from "./utils/loadConfig.ts";
import { TMDB } from "npm:tmdb-ts";
import { prepareTmdbQuery } from "./utils/shows.ts";
import { SearchQuery } from "./types/index.ts";
// Load config file
const config = loadConfig();

const shows: SearchQuery[] = [];
if (config?.show_folder) {
	if (!isDirectory(config.show_folder)) {
		displayError({
			when: "Loading show directory",
			message: "Either file is not a direcotry, or it does not exist",
			exit: true,
		});
	}

	const dirs = Deno.readDirSync(config.show_folder);

	for (const dir of dirs) {
		if (!dir.isDirectory) continue;
		shows.push(prepareTmdbQuery(dir.name));
	}
}

if (config?.tmdb_key) {
	const tmdb = new TMDB(config.tmdb_key);

	for (const show of shows) {
		const query = await tmdb.search.tvShows(show);
		if (!(query.total_results > 0)) {
			displayError({ when: "Searching for a show", message: "could not find " + show.query });
			continue;
		}

		const firstResult = query.results[0];
		console.log(`${firstResult.name} / ${firstResult.popularity} TMDB id: ${firstResult.id}`);
	}
} else {
	console.log(shows);
}
