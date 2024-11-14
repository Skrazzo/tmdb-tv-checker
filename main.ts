import { TMDB } from "npm:tmdb-ts";

if (!Deno.env.has("TMDB")) {
	console.error(
		'Please add your tmdb api key in .env file as "TMDB" or add --env-file tag if it\'s not present',
	);
	Deno.exit(1);
}

const tmdb_api: string | undefined = Deno.env.get("TMDB");
if (!tmdb_api) {
	console.error("Please add your tmdb api key cannot be empty");
	Deno.exit(1);
}

const tmdb = new TMDB(tmdb_api);

(async () => {
	let search = await tmdb.search.tvShows({ query: "Ozark" });
	console.log(search);
})();
