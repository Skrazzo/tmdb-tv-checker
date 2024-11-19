import { SearchQuery } from "../types/index.ts";

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
	let matches:string[] | null ;
	if (name.toLowerCase().includes('ep') && name.toLowerCase().includes('se')) {
		matches=name.match(/(?<=ep)\d{1,2}/gmi);
	}else {
		matches=name.match(/(?<=e)\d{1,2}/gmi);

	}

	if(!matches || matches.length === 0) {
		// Check if theres weird episode count like 01x01
		matches = name.match(/\dx\d/gmi);
		if(!matches || matches.length === 0) {
			return null;
		}
	}

	try {
		episode = parseInt(matches[0]);
	} catch (_err) {
		return null;
	}

	return episode;
}