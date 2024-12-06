import migrate from "../database/migrate.ts";
import DatabaseModule from "../database/db.ts";
import { loadConfig } from "./loadConfig.ts";
import { Path } from "jsr:@david/path";
import { SqliteError } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import moment from "moment";
import { version } from "../variables/var.ts";
import {Table, ColumnOptions} from 'jsr:@cliffy/table@^1.0.0-rc.7';

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
		boolean: ["migrate", "migrate-fresh", "migrate-down", "help", "version", 'list-shows'],
		string: ["ignore", "notice", 'list-episodes'],
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
	} 
	else if (flags["migrate-down"]) {
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
	}else if(flags['list-shows']) {
		const shows = await db.selectFrom('shows')
			.select(['id','tmdb_id', 'title', 'overview', 'user_score as rating'])
			.execute()


		const center:ColumnOptions = {align: 'center'};
		const table: Table = new Table()
			.header(['Show ID', 'TMDB ID', 'Title', 'Overview','Rating', 'Seasons', 'Ignored'])
			.maxColWidth(50)
			.padding(1)
			.indent(2)
			.columns([center, center, {}, {}, center, center, center])
			.border();
		
		// Add additional columns
		for(const show of shows) {
			const seasonCount = (await db.selectFrom('episodes')
				.select('season')
				.distinct()
				.where('show_id', '=', show.id)
				.execute()).length;
			
			const ignore = await db.selectFrom('ignore')
				.selectAll()
				.where('show_id', '=', show.id)
				.executeTakeFirst();
			table.push([
				...Object.values(show).map(s => s ? s : ''),
				seasonCount,
				ignore ? 'Ignored': ''
			]);
		}
		
		table.render();

		Deno.exit(0);
	} else if (flags["list-episodes"]) {
		const showId = Number(flags['list-episodes']);
		if(!showId) {
			console.log('Incorrect show id format');
			Deno.exit(1);
		}

		const episodes = await db.selectFrom('episodes')
			.select(['season', 'episode', 'title', 'user_score', 'release_date', 'overview'])
			.where('show_id', '=', showId)
			.execute();

		if(episodes.length === 0) {
			console.log('Could not find any episodes');
			Deno.exit(1)
		}

		
		const center:ColumnOptions = {align: 'center'};
		const table: Table = new Table()
			.header(['Season', 'Episode', 'Title', 'Rating', 'Release date', 'Overview'])
			.maxColWidth(50)
			.padding(1)
			.indent(2)
			.columns([center, center, {}, center, center])
			.border()
		
		for(const ep of episodes) {
			table.push(Object.values(ep).map(ep => ep ? ep : ''));
		}

		table.render();

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
	} else if (flags.version) {
		console.log(`Show checker version: ${version}`);
		Deno.exit();
	}

	// TODO: Create --help and --version
}
