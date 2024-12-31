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
import migrate from "./database/migrate.ts";
import { SqliteError } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

moment.defaultFormat = momentFormat;

// Parse arguments first
const flags = parseArgs(Deno.args, {
	boolean: ["help", "start", "no-email"],
	string: ["migrate", "ignore", "notice", "list"],
});

// If no command given or --help, show help menu
if (Object.keys(flags).length === 0 || flags.help) {
	await checkArguments();
	Deno.exit(0);
}

// Check for other commands
if (!flags.start) {
	await checkArguments();
	Deno.exit(0);
}

// Main function starts here if --start is provided
const config = loadConfig();
if (!config) Deno.exit(1);
if (!config.database) Deno.exit(1);

const db = database.initiate(config.database);

// Check if database exists and is migrated
try {
	// Try to query the database - this will fail if tables don't exist
	await db.selectFrom("shows").selectAll().execute();
} catch (error) {
	if (error instanceof SqliteError) {
		console.log("Database not found or not migrated. Creating database...");
		try {
			await migrate.up(db);
			console.log("Database created successfully");
		} catch (migrateError) {
			console.error("Failed to create database:", migrateError);
			Deno.exit(1);
		}
	} else {
		console.error("Unexpected error:", error);
		Deno.exit(1);
	}
}

const tmdb = new TMDB(config.tmdb_key);

// Scan all configured directories
let allShows: ShowScan[] = [];
for (const folder of config.show_folders) {
	const showPath = new Path(folder);
	const shows = getShowApi(showPath);
	allShows = [...allShows, ...shows];
}

const report: Report = {
	deleted: await cleanCache(db), // Clean up database
	updated: await updateCache(tmdb, db), // Update database information
	added: await createCache(shows, tmdb, db), // Create cache for new files
	pathUpdated: await checkMissingEpisodes(shows, db), 
	missing: await findMissing(db), // Find missing episodes
};

console.log(report);

if (report.missing.length > 0 && config.email.send_email && !flags["no-email"]) {
	const html = generateHTML(report.missing);
	await sendEmail(config.email, html);
	console.log("Email sent to: " + config.email.email);
} else if (report.missing.length === 0) {
	console.log("No missing episodes found");
}

db.destroy();
