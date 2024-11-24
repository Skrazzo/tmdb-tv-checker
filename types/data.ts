export interface Config {
	tmdb_key: string | null;
	show_folder: string | null;
	database: string | null;
}

interface Show {
	name: string;
}

interface PosterShow extends Show {
	poster: string | null;
}

export interface Report {
	updated: PosterShow[];
	added: PosterShow[];
	notFound: Show[];
	deleted: PosterShow[];
	skipped: Show[];
}