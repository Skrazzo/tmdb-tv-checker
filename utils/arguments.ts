import migrate from "../database/migrate.ts";
import DatabaseModule from "../database/db.ts";
import { loadConfig } from "./loadConfig.ts";
import { Path } from "jsr:@david/path";
import { SqliteError } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

// Checks for special arguments to execute commands
export async function checkArguments() {
	const args = Deno.args;
	// Load config file
	const config = loadConfig();
	if (!config) Deno.exit(1);
	if (!config.database) Deno.exit(1);

	const dbPath = new Path(config.database);

	// TODO: Create a better way to make command line commands

	// TODO: Add ability to request show
	// TODO: Add ability to delete certain show from database
	// TODO: Add ability to list all shows, and see updates with a command

	if (args.includes("--migrate")) {
		// Do database table migrations
		try {
			console.log("Starting database migration");
			const db = DatabaseModule.initiate(dbPath.toString());
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
	} else if (args.includes("--migrate-down")) {
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
	} else if (args.includes("--migrate-fresh")) {
		// Delete database and migrate it from scratch
		try {
			const deleteDB: boolean = confirm("Are you sure you want to delete your database?");
			if (deleteDB) {
				await dbPath.remove();
				const db = DatabaseModule.initiate(dbPath.toString());
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
	}

	// TODO: Create --help and --version
}
