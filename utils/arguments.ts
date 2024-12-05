import migrate from "../database/migrate.ts";
import DatabaseModule from "../database/db.ts";
import { loadConfig } from "./loadConfig.ts";
import { Path } from "jsr:@david/path";
import { SqliteError } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import moment from "moment";

// Checks for special arguments to execute commands
export async function checkArguments() {
	// Load config file
	const config = loadConfig();
	if (!config) Deno.exit(1);
	if (!config.database) Deno.exit(1);

	// Init DB
	const dbPath = new Path(config.database);
	const db = DatabaseModule.initiate(dbPath.toString());

	// Get arguments from command line https://docs.deno.com/examples/command-line-arguments/
	const flags = parseArgs(Deno.args, {
		boolean: ["migrate", "migrate-fresh", "migrate-down"],
		string: ["ignore", "notice"],
	});

	// TODO: Add ability to list all shows, and see updates with a command

	if (flags.migrate) {
		// Do database table migrations
		try {
			console.log("Starting database migration");
			await migrate.up(db);
			console.log("Finished database migration");
		} catch (err) {
			if (err instanceof SqliteError) {
				console.error(`If database already is migrated? Try --migrate-fresh\n${err}`);
			} else {
				console.error(err);
			}
		} finally {
			Deno.exit();
		}
	} else if (flags["migrate-down"]) {
		// Delete database
		try {
			const deleteDB: boolean = confirm("Are you sure you want to delete your database?");
			if (deleteDB) {
				await dbPath.remove();
				console.log("Database deleted successfully");
			} else {
				console.log("Deletion canceled");
			}
		} catch (err) {
			console.error(err);
		} finally {
			Deno.exit();
		}
	} else if (flags["migrate-fresh"]) {
		// Delete database and migrate it from scratch
		try {
			const deleteDB: boolean = confirm("Are you sure you want to delete your database?");
			if (deleteDB) {
				await dbPath.remove();
				await migrate.up(db);

				console.log("Migrated database");
			} else {
				console.log("Canceled");
			}
		} catch (err) {
			console.error(err);
		} finally {
			Deno.exit();
		}
	} else if (flags.ignore) {
		// Get id from arguments on which show we need to add to the ignore list
		const showId: number = Number(flags.ignore);
		if (!showId) {
			console.error(`Incorrect format: ${flags.ignore}. Expected a number`);
			Deno.exit(1);
		}

		// Check if show like that exists in the database, and then add it to ignore table
		const show = await db.selectFrom("shows").selectAll().where("id", "=", showId).executeTakeFirst();

		if (!show) {
			console.error(`Show with id: ${showId} does not exist`);
			Deno.exit(1);
		}

		// Add show to the ignore table
		try {
			const ignoreRow = await db.selectFrom("ignore")
				.selectAll()
				.where("show_id", "=", showId)
				.executeTakeFirst();

			if (ignoreRow) {
				console.log(`${show.title} is already on the ignore list`);
				Deno.exit();
			}

			await db.insertInto("ignore").values({
				show_id: showId,
				last_checked: moment().format(),
			}).execute();
		} catch (err) {
			console.error(`Unexpected error: ${err}`);
			Deno.exit(1);
		} finally {
			console.log(`Show "${show.title}" was added to the ignore list`);
			Deno.exit();
		}
	} else if (flags.notice) {
		// Get id from arguments on which show we need to add to the ignore list
		const showId: number = Number(flags.notice);
		if (!showId) {
			console.error(`Incorrect format: ${flags.notice}. Expected a number`);
			Deno.exit(1);
		}

		try {
			await db.deleteFrom("ignore").where("show_id", "=", showId).execute();
		} catch (err) {
			console.error(`Unexpected error: ${err}`);
			Deno.exit(1);
		} finally {
			console.log(`Successfully noticed show with id ${showId}`);
			Deno.exit();
		}
	}

	// TODO: Create --help and --version
}
