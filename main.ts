import { Path } from "jsr:@david/path";
import { NewEpisode, NoInsertResult, NotFoundError, Report, SearchQuery, Show, ShowScan } from "./types/index.ts";
import { loadConfig } from "./utils/loadConfig.ts";
import { getEpisodePath, getShowApi, prepareTmdbQuery } from "./utils/shows.ts";
import Database from "./database/db.ts";

import { ErrorResponse, Search, SeasonDetails, TMDB, TV, TvShowDetails } from "npm:tmdb-ts";

// Set default moment format
import moment from "npm:moment";
import { momentFormat } from "./variables/var.ts";
moment.defaultFormat = momentFormat;

// Check arguments for special commands (db migration, etc..)
import { checkArguments } from "./utils/arguments.ts";
import { formatEpisodeDatabase, formatShowDatabase } from "./utils/tmdb.ts";
import { NewShow } from "./types/db.ts";
import { SqliteError } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { InsertResult } from "kysely";
await checkArguments();

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

	if (!config.tmdb_key || config.tmdb_key === "") {
		throw new NotFoundError({
			cause: "Could not find TMDB api key",
			message: "Key was empty or doesn't exist when loading it from config in main.ts",
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
	};

	for (const show of shows) {
		// Check if theres aleady cached info in database
		let showRow;
		try {
			showRow = await db.selectFrom("shows")
				.selectAll()
				.where("path", "==", show.path.toString())
				.executeTakeFirst();
		} catch (err) {
			if (err instanceof SqliteError) {
				console.error(`Have you migrated database with --migrate or --migrate-fresh? ${err}`);
			} else {
				console.error(`Unexpected error appeared ${err}`);
			}
			Deno.exit(1);
		}

		if (showRow) {
			// TODO: Later add, that cache is updated after certain period of time (defined in config)
			report.skipped.push({ name: showRow.title });
			continue; 
		}

		// Find tmdb show based on a show folder name
		// Prepare tmdb query search
		const sq: SearchQuery = prepareTmdbQuery(show.path.basename());
		const search: Search<TV> = await tmdb.search.tvShows(sq);

		if (search.total_results === 0) {
			report.notFound.push({ name: sq.query });
			continue;
		}

		// Take first search result, and query details for it
		const details: TvShowDetails = await tmdb.tvShows.details(search.results[0].id);

		// Extract needed information, and add path to it
		const newShow: NewShow = formatShowDatabase(details);
		newShow.path = show.path.toString();

		// Add show to the database, and update report
		showRow = await db.insertInto("shows").values(newShow).executeTakeFirst();
		report.added.push({ name: newShow.title, poster: newShow.poster || null });

		if (showRow.insertId === undefined) {
			throw new NoInsertResult({
				cause: "Could not retrieve insertId from row insert",
				message:
					`Adding show "${newShow.title}" into the database, and could not retrieve insertId, something went wrong`,
			});
		}

		// Add show episodes and seasons
		let seasonNumber = 1;
		while (true) {
			let season: SeasonDetails | null = null;

			// Tries to fetch season, if reaches season that does not exist, breaks the loop, and goes to the next show
			try {
				season = await tmdb.tvSeasons.details({ tvShowID: newShow.tmdb_id, seasonNumber: seasonNumber });
			} catch (_err) {
				break;
			}
			if (!season) break;
			seasonNumber++;

			// Extracts information
			for (const episode of season.episodes) {
				const epInfo: NewEpisode = formatEpisodeDatabase(episode, showRow.insertId);
				const epPath: Path | null = getEpisodePath({se: episode.season_number, ep: episode.episode_number, showFileSystem: show});
			
				if(epPath) epInfo.path = epPath.toString();
				db.insertInto('episodes').values(epInfo).execute();
			}
		}
	}

	console.log(report);
} catch (err) {
	console.log(err);
	Deno.exit(1);
}
