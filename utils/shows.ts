import { SearchQuery } from "../types/index.ts";

export function prepareTmdbQuery(folderName: string): SearchQuery  {
	let name:string = folderName;
	let year = undefined;
	// Convert to lower case letters
	name= name.toLowerCase();

	// Find a year
	const matches: string[] | null = name.match(/\d{4}/gm);
	if(matches && matches.length > 0) {
		year = parseInt(matches[0]) || undefined;
	}

	// replace all brackets
	name = name.replace(/[()]|\d{4}/gm, "");

	// Replace special characters
	name = name.replace(/[-_.+@#!]/gm, " ");
	name = name.replace(/&/gm, "and");
	
	// Trim text
	name = name.trim();
	
	return {query: name, year: year};
}
