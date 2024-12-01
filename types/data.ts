export interface Config {
	tmdb_key: string;
	show_folder: string;
	database: string;
	update_freq: number;
	email: {
		resend_key: string;
		subject: string;
		email: string;
	};
}

export interface LoadConfig extends Omit<Config, "update_freq"> {
	update_freq: string;
}

interface ShowChanges {
	shows: number;
	episodes: number;
}

export interface Report {
	deleted: ShowChanges;
	updated: ShowChanges;
	added: ShowChanges;
	missing: MissingShow[];
}

export interface MissingShow {
	name: string;
	episodes: MissingEpisode[];
}

export interface MissingEpisode {
	name: string;
	episode: number;
	season: number;
}
