import { Episode, TvShowDetails } from "tmdb-ts";
import { NewEpisode, NewShow } from "../types/index.ts";
import moment from "npm:moment";

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

export function formatEpisodeDatabase(episode: Episode, show_id: bigint): NewEpisode {
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
