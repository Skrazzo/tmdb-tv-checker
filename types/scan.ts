export interface EpisodeScan {
    episode: number;
    path: string;
}

export interface SeasonScan {
    season: number;
    path: string;
    episodes: {
        [key: string]: EpisodeScan;
    }
}

export interface ShowScan {
    name: string;
    path: string;
    seasons: {
        [key: string]: SeasonScan;
    };
}