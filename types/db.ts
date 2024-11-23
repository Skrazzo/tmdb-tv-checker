import { Generated, Insertable, Selectable, Updateable } from "npm:kysely";

export interface Database {
	shows: ShowTable;
	episodes: EpisodeTable;
}

export interface ShowTable {
	id: Generated<number>;
	tmdb_id: number;
	path: string | null;
	title: string | null;
	status: "Ended" | "Returning Series" | "In Production" | "Canceled" | "Pilot" | "Planned" | null;
	banner: string | null;
	poster: string | null;
	trailer: string | null;
	requested: boolean;
	user_score: number | null;
	year: number | null;
	overview: string | null;
	release_date: string | null;
	last_checked: string;
}
export type Show = Selectable<ShowTable>;
export type NewShow = Insertable<ShowTable>;
export type UpdateShow = Updateable<ShowTable>;

export interface EpisodeTable {
	id: Generated<number>;
	show_id: number;
	season: number;
	episode: number;
	path: string | null;
	title: string | null;
	overview: string | null;
	release_date: string | null;
	length: number | null;
	user_score: number | null;
	last_checked: string;
}
export type Episode = Selectable<EpisodeTable>;
export type NewEpisode = Insertable<EpisodeTable>;
export type UpdateEpisode = Updateable<EpisodeTable>;
