export interface Config {
	tmdb_key: string;
	show_folder: string;
	database: string;
	update_freq: number;
}

interface Show {
	name: string;
}

interface PosterShow extends Show {
	poster: string | null;
}

// ========= Reports ===========

export interface Report {
	skipped: Show[];
}
export interface CreateReport extends Report {
	added: PosterShow[];
	notFound: Show[];
}

export interface UpdateReport extends Report {
	updated: PosterShow[];
}