import { numberlike } from "moment";

export interface Config {
	tmdb_key: string;
	show_folder: string;
	database: string;
	update_freq: number;
}

interface ShowChanges {
	shows: number;
	episodes: number;
}

export interface Report {
	deleted: number;
	updated: ShowChanges;
	added: ShowChanges;
	missing: Show[];
}

interface Show {
	name: string;
	episode: number;
	season: number;
}
