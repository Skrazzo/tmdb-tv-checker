import migrate from "../database/migrate.ts";
import DatabaseModule from "../database/db.ts";
import { loadConfig } from "./loadConfig.ts";
import { Path } from "jsr:@david/path";
import { SqliteError } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import moment from "moment";
import { version } from "../variables/var.ts";
import { Table, ColumnOptions } from "jsr:@cliffy/table@^1.0.0-rc.7";

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
		boolean: ["help", "version", "v"],
		string: ["ignore", "notice", "migrate", "list"],
	});

	if (flags.migrate !== undefined) {
		// Handle empty --migrate flag
		if (flags.migrate === "") {
			try {
				console.log("Starting database migration");
				await migrate.up(db);
				console.log("Finished database migration");
			} catch (err) {
				if (err instanceof SqliteError) {
					console.error(`If database already is migrated? Try --migrate fresh\n${err}`);
				} else {
					console.error(err);
				}
			}
			Deno.exit();
		}

		switch (flags.migrate.toLowerCase()) {
			case "fresh":
				try {
					const deleteDB: boolean = confirm(
						"Are you sure you want to delete and recreate your database?"
					);
					if (deleteDB) {
						await dbPath.remove();
						await migrate.up(db);
						console.log("Database recreated successfully");
					} else {
						console.log("Operation canceled");
					}
				} catch (err) {
					console.error(err);
				}
				break;
			case "down":
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
				}
				break;
			default:
				try {
					console.log("Starting database migration");
					await migrate.up(db);
					console.log("Finished database migration");
				} catch (err) {
					if (err instanceof SqliteError) {
						console.error(`If database already is migrated? Try --migrate fresh\n${err}`);
					} else {
						console.error(err);
					}
				}
		}
		Deno.exit();
	}

	if (flags.list !== undefined) {
		const showId = flags.list ? Number(flags.list) : null;

		if (showId) {
			// List episodes for specific show
			const episodes = await db
				.selectFrom("episodes")
				.select(["season", "episode", "title", "user_score", "release_date", "overview"])
				.where("show_id", "=", showId)
				.execute();

			if (episodes.length === 0) {
				console.log("Could not find any episodes");
				Deno.exit(1);
			}

			const center: ColumnOptions = { align: "center" };
			const table: Table = new Table()
				.header(["Season", "Episode", "Title", "Rating", "Release date", "Overview"])
				.maxColWidth(50)
				.padding(1)
				.indent(2)
				.columns([center, center, {}, center, center])
				.border();

			for (const ep of episodes) {
				table.push(Object.values(ep).map((ep) => (ep ? ep : "")));
			}

			table.render();
		} else {
			// List all shows
			const shows = await db
				.selectFrom("shows")
				.select(["id", "tmdb_id", "title", "overview", "user_score as rating"])
				.execute();

			const center: ColumnOptions = { align: "center" };
			const table: Table = new Table()
				.header(["Show ID", "TMDB ID", "Title", "Overview", "Rating", "Seasons", "Ignored"])
				.maxColWidth(50)
				.padding(1)
				.indent(2)
				.columns([center, center, {}, {}, center, center, center])
				.border();

			for (const show of shows) {
				const seasonCount = (
					await db
						.selectFrom("episodes")
						.select("season")
						.distinct()
						.where("show_id", "=", show.id)
						.execute()
				).length;

				const ignore = await db
					.selectFrom("ignore")
					.selectAll()
					.where("show_id", "=", show.id)
					.executeTakeFirst();
				table.push([
					...Object.values(show).map((s) => (s ? s : "")),
					seasonCount,
					ignore ? "Ignored" : "",
				]);
			}

			table.render();
		}
		Deno.exit(0);
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
			const ignoreRow = await db
				.selectFrom("ignore")
				.selectAll()
				.where("show_id", "=", showId)
				.executeTakeFirst();

			if (ignoreRow) {
				console.log(`${show.title} is already on the ignore list`);
				Deno.exit();
			}

			await db
				.insertInto("ignore")
				.values({
					show_id: showId,
					last_checked: moment().format(),
				})
				.execute();
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
	} else if (flags.version || flags.v) {
		console.log(`Show checker version: ${version}`);
		Deno.exit();
	} else {
		const argumentTable: Table = Table.from([
			["--help", "Displays this menu"],
			["--start", "Starts the checker"],
			["--config", "Creates config file"],
			["--list", "Displays cached shows in a table format"],
			["--list <show_id>", "Displays episodes for specified show"],
			["--ignore <show_id>", "Ignores a show, missing episodes do not show up in the report"],
			["--notice <show_id>", "Notices a show, appears in report"],
			["--migrate", "Creates database migration"],
			["--migrate down", "Deletes current database"],
			["--migrate fresh", "Deletes and migrates database"],
			["--version or --v", "Displays current version"],
		]).padding(2);

		const help = `
		$br
		Show checker version: ${version}
		Is an app that scans folder with shows, compares local episodes with tmdb database,
		and notifies you about missing episodes via E-mail or CLI

		GitHub repo: https://github.com/Skrazzo/tmdb-tv-checker
		$br
		Acceptable arguments:
		${argumentTable.toString()}
		$br
		`;

		// Filter output
		const output: string[] = [];
		for (let line of help.split("\n")) {
			line = line.trim();
			line = line.replace(/\$tab/gi, "\t");
			line = line.replace(/\$br/gi, "\n");

			if (line !== "") {
				output.push(line);
			}
		}

		console.log(output.join("\n"));
		Deno.exit();
	}
}
