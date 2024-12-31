import { Path } from "jsr:@david/path";
import { Report, ShowScan } from "./types/index.ts";
import { loadConfig } from "./utils/loadConfig.ts";
import { getShowApi } from "./utils/shows.ts";
import database from "./database/db.ts";
import { TMDB } from "npm:tmdb-ts";
import moment from "npm:moment";
import { momentFormat } from "./variables/var.ts";
import { checkArguments } from "./utils/arguments.ts";
import { checkMissingEpisodes, cleanCache, createCache, findMissing, updateCache } from "./utils/tmdb.ts";
import { generateHTML, sendEmail } from "./utils/emails.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";

moment.defaultFormat = momentFormat;

await checkArguments();
console.log("arguments were checked, starting");
Deno.exit(0);

const args = parseArgs(Deno.args, {
	boolean: ["no-email"],
});

const config = loadConfig();
if (!config) Deno.exit(1);
if (!config.database) Deno.exit(1);

const db = database.initiate(config.database);
const tmdb = new TMDB(config.tmdb_key);

// Scan all configured directories
let allShows: ShowScan[] = [];
for (const folder of config.show_folders) {
	const showPath = new Path(folder);
	const shows = getShowApi(showPath);
	allShows = [...allShows, ...shows];
}

const report: Report = {
	deleted: await cleanCache(db),
	updated: await updateCache(tmdb, db),
	added: await createCache(allShows, tmdb, db),
	pathUpdated: await checkMissingEpisodes(allShows, db),
	missing: await findMissing(db),
};

console.log(report);

if (report.missing.length > 0 && config.email.send_email && !args["no-email"]) {
	const html = generateHTML(report.missing);
	await sendEmail(config.email, html);
	console.log("Email sent to: " + config.email.email);
} else if (report.missing.length === 0) {
	console.log("No missing episodes found");
}

db.destroy();
