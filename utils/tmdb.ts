import { Episode, Search, SeasonDetails, TMDB, TV, TvShowDetails } from "tmdb-ts";
import { CreateReport, Database, NewEpisode, NewShow, NoInsertResult, SearchQuery, ShowScan, UpdateReport } from "../types/index.ts";
import moment from "npm:moment";
import { SqliteError } from "https://deno.land/x/sqlite@v3.9.1/src/error.ts";
import { Kysely } from "kysely";
import { getEpisodePath, prepareTmdbQuery } from "./shows.ts";
import { Path } from "@david/path";
import { loadConfig } from "./loadConfig.ts";

/**
 * Takes TvShowDetails object from tmdb api, and extracts only needed information for database
 * @param {TvShowDetails} details
 * @returns {NewShow} object that is used to create new row in database
 */
export function formatShowDatabase(details: TvShowDetails): NewShow {
	const availableStatuses = ["Ended", "Returning Series", "In Production", "Canceled", "Pilot", "Planned"];
	const statusIdx = availableStatuses.indexOf(details.status);

	return {
		tmdb_id: details.id,
		status: (statusIdx > -1) ? availableStatuses[statusIdx] : null,
		title: details.name,
		banner: details.backdrop_path || null,
		poster: details.poster_path || null,
		requested: false,
		user_score: Math.round(details.vote_average * 10),
		year: parseInt(moment(details.first_air_date).format("YYYY")),
		overview: details.overview || null,
		last_checked: moment().format(),
	};
}

export function formatEpisodeDatabase(episode: Episode, show_id: number | bigint): NewEpisode {
	return {
		show_id: show_id,
		season: episode.season_number,
		episode: episode.episode_number,
		title: episode.name,
		overview: episode.overview,
		release_date: episode.air_date,
		length: episode.runtime,
		user_score: Math.round(episode.vote_average * 10),
		last_checked: moment().format(),
	};
}

export async function createCache(shows: ShowScan[], tmdb: TMDB, db: Kysely<Database>): Promise<CreateReport> {
	// Create report object, which later will be used to report to user
	const report: CreateReport = {
		added: [],
		skipped: [],
		notFound: [],
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
				const epPath: Path | null = getEpisodePath({
					se: episode.season_number,
					ep: episode.episode_number,
					showFileSystem: show,
				});

				if (epPath) epInfo.path = epPath.toString();
				db.insertInto("episodes").values(epInfo).execute();
			}
		}
	}

	return report;
}

export async function updateCache(tmdb: TMDB, db: Kysely<Database>): Promise<UpdateReport>{
	const config = loadConfig();
	const report: UpdateReport = {
		skipped: [],
		updated: [],
	}

	const showDB = await db.selectFrom('shows').selectAll().execute();
	
	// Update all shows that havent ended,
	// and they havent been checked in less than specified time in config
	for(const showRow of showDB) {
		// Skip shows that not need to be checked
		if(showRow.status === 'Ended') {
			report.skipped.push({name: showRow.title});
			continue;
		}

		let diff: number = moment(showRow.last_checked).diff(moment(), 'hours', true);
		// Convert to positive hours
		if(diff < 0){
			diff = diff * -1
		}

		if(diff < config.update_freq) {
			report.skipped.push({name: showRow.title});
			continue;
		}
		
		let seasonNumber: number = 1;
		while(true) {
			let details: SeasonDetails;
			
			try {
				details=  await tmdb.tvSeasons.details({tvShowID: showRow.tmdb_id ,seasonNumber: seasonNumber});
			} catch (_err) {
				break;
			}

			for(const ep of details.episodes) {
				const epInfo: NewEpisode = formatEpisodeDatabase(ep, showRow.tmdb_id);
				await db.updateTable('episodes').set({
					title: epInfo.title,
					overview: epInfo.overview,
					release_date: epInfo.release_date,
					length: epInfo.length,
					last_checked: moment().format()
				})
					.where('show_id', '=', showRow.id)
					.where('season','=', epInfo.season)
					.where('episode','=', epInfo.episode)
					.execute();

				
			}

			seasonNumber++;
		}
		
		
		await db.updateTable('shows')
			.set({last_checked: moment().format()})
			.where('id', '=', showRow.id)
			.execute();
		
		report.updated.push({
			name: showRow.title,
			poster: showRow.poster			
		});
	}

	return report;
}
