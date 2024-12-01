import { Path } from "jsr:@david/path";
import { Report, ShowScan } from "./types/index.ts";
import { loadConfig } from "./utils/loadConfig.ts";
import { getShowApi } from "./utils/shows.ts";
import database from "./database/db.ts";

import { TMDB } from "npm:tmdb-ts";

// Set default moment format
import moment from "npm:moment";
import { momentFormat } from "./variables/var.ts";
moment.defaultFormat = momentFormat;

// Check arguments for special commands (db migration, etc..)
import { checkArguments } from "./utils/arguments.ts";
import { cleanCache, createCache, findMissing, updateCache } from "./utils/tmdb.ts";
import { generateHTML, sendEmail } from "./utils/emails.ts";
await checkArguments();

// Load config file
const config = loadConfig();
if (!config) Deno.exit(1);
if (!config.database) Deno.exit(1);

const db = database.initiate(config.database);

// Get all needed information to fill show database
const tmdb = new TMDB(config.tmdb_key);

// Scan file-system, based on filesystem create database show cache
const showPath = new Path(config.show_folder);
const shows: ShowScan[] = getShowApi(showPath);

// Prepare report
const report: Report = {
	deleted: await cleanCache(db), // Clean up database
	updated: await updateCache(tmdb, db), // Update database information
	added: await createCache(shows, tmdb, db), // Create cache for new files
	missing: await findMissing(db), // Find missing episodes
};

// Log report
console.log(report);

// Write out html
if (report.missing.length > 0) {
	const html = generateHTML(report.missing);
	await sendEmail(config.email, html);
	console.log("Email sent to: " + config.email.email);
} else {
	console.log("No missing episodes found");
}

db.destroy(); // Disconnect from database
