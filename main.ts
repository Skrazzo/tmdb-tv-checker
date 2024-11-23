import { Path } from "jsr:@david/path";
import { NotFoundError, ShowScan } from "./types/index.ts";
import { loadConfig } from "./utils/loadConfig.ts";
import { getShowApi } from "./utils/shows.ts";
import Database from "./database/db.ts";

// Load config file
const config = loadConfig();
if (!config) Deno.exit(1);
if (!config.database) Deno.exit(1);

// Check arguments for special commands
import { checkArguments } from "./utils/arguments.ts";
checkArguments();

// Initiate database connection
const db = Database.initiate(config.database);
db.destroy();

// if (Deno.args.includes("--migrate")) {
// 	try {
// 		await migrate.up(db);
// 		console.log("Migration successful");
// 		Deno.exit();
// 	} catch (err) {
// 		console.error(err);
// 	}
// }

// if (Deno.args.includes("--migrate-down")) {
// 	try {
// 		await migrate.down(db);
// 		console.log("Dropped tables successfully");
// 		Deno.exit();
// 	} catch (err) {
// 		console.error(err);
// 	}
// }

try {
	if (!config.show_folder) {
		throw new NotFoundError({
			cause: "Could not find show folder when scanning for shows",
			message: config.show_folder || "No folder specified",
		});
	}

	const showPath = new Path(config.show_folder);
	const api: ShowScan[] = getShowApi(showPath);
} catch (err) {
	console.log(err);
	Deno.exit(1);
}
