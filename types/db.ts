import { Generated, Insertable, Selectable, Updateable } from "npm:kysely";

export interface Database {
	shows: ShowTable;
	episodes: EpisodeTable;
}

export interface ShowTable {
	id: Generated<number>;
	tmdb_id: number;
	path: string | null;
	title: string;
	status: string | null;
	banner: string | null;
	poster: string | null;
	user_score: number;
	year: number;
	overview: string | null;
	last_checked: string;
}
export type Show = Selectable<ShowTable>;
export type NewShow = Insertable<ShowTable>;
export type UpdateShow = Updateable<ShowTable>;

export interface EpisodeTable {
	id: Generated<number>;
	show_id: number | bigint;
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
