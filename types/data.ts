export interface Config {
	tmdb_key: string;
	show_folder: string;
	database: string;
	updateFreq: number;
}

interface Show {
	name: string;
}

interface PosterShow extends Show {
	poster: string | null;
}

export interface Report {
	skipped: Show[];
}
export interface CreateReport extends Report {
	added: PosterShow[];
	notFound: Show[];
}
