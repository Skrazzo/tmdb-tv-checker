import { NotFoundError, ShowScan } from "./types/index.ts";
import { loadConfig } from "./utils/loadConfig.ts";
import { scanShows } from "./utils/shows.ts";

// Load config file
const config = loadConfig();
if (!config) Deno.exit(1);

try {
	if (!config.show_folder) {
		throw new NotFoundError({
			cause: "Could not find show folder when scanning for shows",
			message: config.show_folder || "No folder specified",
		});
	}

	const api: ShowScan[] = scanShows(config.show_folder);
	console.log("----");
	console.log(api);
} catch (err) {
	console.log(err);
	Deno.exit(1);
}
