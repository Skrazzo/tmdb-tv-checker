import { Path } from "jsr:@david/path";
import { NotFoundError, Report, SearchQuery, ShowScan } from "./types/index.ts";
import { loadConfig } from "./utils/loadConfig.ts";
import { getShowApi, prepareTmdbQuery } from "./utils/shows.ts";
import Database from "./database/db.ts";

import { Search, TMDB, TvShowDetails, TV } from "npm:tmdb-ts";

// Set default moment format
import moment from 'npm:moment';
import { momentFormat } from "./variables/var.ts";
moment.defaultFormat = momentFormat;


// Check arguments for special commands (db migration, etc..)
import { checkArguments } from "./utils/arguments.ts";
import { formatShowDatabase } from "./utils/tmdb.ts";
import { NewShow } from "./types/db.ts";
checkArguments();


// Load config file
const config = loadConfig();
if (!config) Deno.exit(1);
if (!config.database) Deno.exit(1);

// initialise database connection
const db = Database.initiate(config.database);


try {
	if (!config.show_folder) {
		throw new NotFoundError({
			cause: "Could not find show folder when scanning for shows",
			message: config.show_folder || "No folder specified",
		});
	}

	if(!config.tmdb_key || config.tmdb_key === "") {
		throw new NotFoundError({
			cause: "Could not find TMDB api key",
			message: "Key was empty or doesn't exist when loading it from config in main.ts"
		});
	}

	// TODO: Clean old cache
	// TODO: Delete from cache database, where path does not exist anymore
	
	// Get all needed information to fill show database
	const tmdb = new TMDB(config.tmdb_key);

	// Scan file-system, based on filesystem create database show cache
	const showPath = new Path(config.show_folder);
	const shows: ShowScan[] = getShowApi(showPath);

	// Create report object, which later will be used to report to user
	const report: Report = {
		updated: [],
		added: [],
		notFound: [],
		deleted: [],
		skipped: [],
	}

	
	
	for(const show of shows) {		
		// Check if theres aleady cached info in database
		const showRow = await db.selectFrom('shows')
			.selectAll()
			.where('path', '==', show.path.toString())
			.executeTakeFirst();
		
		if(showRow) {
			// TODO: Later add, that cache is updated after certain period of time (defined in config)
			report.skipped.push({name: showRow.title})
			continue;
		}
		
		// Find tmdb show based on a show folder name
		// Prepare tmdb query search
		const sq: SearchQuery = prepareTmdbQuery(show.path.basename());
		const search: Search<TV> = await tmdb.search.tvShows(sq);
		
		if(search.total_results === 0) {
			report.notFound.push({ name: sq.query });
			continue;
		}
		
		// Take first search result, and query details for it
		const details: TvShowDetails = await tmdb.tvShows.details(search.results[0].id);
		
		// Extract needed information, and add path to it
		const newShow: NewShow = formatShowDatabase(details); 
		newShow.path = show.path.toString();

		// Add show to the database, and update report
		db.insertInto('shows').values(newShow).execute();
		report.added.push({name: newShow.title, poster: newShow.poster || null});
	}

	console.log(report);
	
} catch (err) {
	console.log(err);
	Deno.exit(1);
}
