import { Path } from "jsr:@david/path";

export interface EpisodeScan {
	episode: number;
	path: Path;
}

export interface SeasonScan {
	season: number;
	path: Path;
	episodes: EpisodeScan[];
}

export interface ShowScan {
	path: Path;
	seasons: SeasonScan[];
}
