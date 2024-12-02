import { NotFoundError, SearchQuery } from "../types/index.ts";
import { EpisodeScan, SeasonScan, ShowScan } from "../types/scan.ts";
import { Path } from "jsr:@david/path";
import { getDirs, getVideoFiles } from "./directory.ts";

export function prepareTmdbQuery(folderName: string): SearchQuery {
	let name: string = folderName;
	let year = undefined;
	// Convert to lower case letters
	name = name.toLowerCase();

	// Find a year
	const matches: string[] | null = name.match(/\d{4}/gm);
	if (matches && matches.length > 0) {
		year = parseInt(matches[0]) || undefined;
	}

	// replace all brackets
	name = name.replace(/[()]|\d{4}/gm, "");

	// Replace special characters
	name = name.replace(/[-_.+@#!]/gm, " ");
	name = name.replace(/&/gm, "and");

	// Trim text
	name = name.trim();

	return { query: name, year: year };
}

// Return season number by giving folder name
export function getSeason(name: string): number | null {
	let season: number;
	const matches: string[] | null = name.match(/\d+/gm);

	if (!matches || matches.length === 0) {
		return null;
	}

	try {
		season = parseInt(matches[0]);
	} catch (_err) {
		return null;
	}
	return season;
}

export function getEpisode(name: string): number | null {
    let episode: number;
    let matches: string[] | null;
   
    // Match patterns like EP01, EP02, etc.
    matches = name.match(/(?<=EP)\d{1,3}/i);
   
    if (!matches || matches.length === 0) {
        // Match patterns like E01, E02, etc.
        matches = name.match(/(?<=E)\d{1,3}/i);
    }
    if (!matches || matches.length === 0) {
        // Match patterns like 01x01
        matches = name.match(/\dx\d{1,3}/i);
    }
    if (!matches || matches.length === 0) {
        return null;
    }
    try {
        episode = parseInt(matches[0]);
    } catch (_err) {
        return null;
    }
    return episode;
}

export function scanShows(showRoot: Path): ShowScan[] {
	let rtn: ShowScan[] = [];
	const notFoundProps = (dir: string): { cause: string; message: string } => ({
		cause: "NotFound in scanShows",
		message: "Could not find this directory" + dir,
	});

	if (!showRoot.existsSync()) {
		throw new NotFoundError(notFoundProps(showRoot.toString()));
	}

	const shows = getDirs(showRoot);
	if (!shows) throw new NotFoundError(notFoundProps(showRoot.toString()));

	rtn = shows.map((show) => {
		const sq: SearchQuery = prepareTmdbQuery(show.basename());

		return {
			name: sq.query,
			year: sq.year,
			path: show,
			seasons: [],
		};
	});

	return rtn;
}

export function scanSeasons(show: ShowScan): SeasonScan[] {
	const rtn: SeasonScan[] = [];
	const seasons: Path[] | null = getDirs(show.path);

	if (!seasons) return [];

	for (const se of seasons) {
		const seNumber: number | null = getSeason(se.basename());
		if (!seNumber) continue;

		rtn.push({
			path: se,
			season: seNumber,
			episodes: [],
		});
	}

	return rtn;
}

export function scanEpisodes(season: SeasonScan): EpisodeScan[] {
	const rtn: EpisodeScan[] = [];

	const episodes: Path[] | null = getVideoFiles(season.path);
	if (!episodes) return [];

	for (const ep of episodes) {
		const epNumber: number | null = getEpisode(ep.basename());
		if (!epNumber) continue;

		rtn.push({
			episode: epNumber,
			path: ep,
		});
	}

	return rtn;
}

export function getShowApi(showFolder: Path): ShowScan[] {
	const api: ShowScan[] = scanShows(showFolder);

	// Scan each show for seasons
	for (const show of api) {
		show.seasons = scanSeasons(show);

		// Go through every season and scan for shows
		for (const season of show.seasons) {
			season.episodes = scanEpisodes(season);
		}
	}

	return api;
}

export function getEpisodePath(
	{ se, ep, showFileSystem }: { se: number; ep: number; showFileSystem: ShowScan },
): Path | null {
	const show: ShowScan = showFileSystem;
	
	const season: SeasonScan = show.seasons.filter(season => season.season === se)[0] || null
	if(!season) return null; // couldnt find rigth season

	// get episodes from the season
	const episodes: EpisodeScan[] = season.episodes;
	const episode = episodes.filter(episode => episode.episode === ep)[0] || null;

	if(!episode) return null;
	return episode.path;
}
