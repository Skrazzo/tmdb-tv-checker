import { Path } from "jsr:@david/path";
import { NotFoundError, ShowScan } from "./types/index.ts";
import { loadConfig } from "./utils/loadConfig.ts";
import { getShowApi } from "./utils/shows.ts";

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

	const showPath = new Path(config.show_folder);
	const api: ShowScan[] = getShowApi(showPath);

	for (const a of api) {
		console.log(a);
	}
} catch (err) {
	console.log(err);
	Deno.exit(1);
}
