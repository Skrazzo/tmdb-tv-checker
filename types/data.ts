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

