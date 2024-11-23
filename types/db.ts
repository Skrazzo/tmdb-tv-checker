export interface testShow {
    id: number;
    show: string;
}

export interface Show {
    id: number;
    tmdb_id: number;
    path: string | null;
    title: string | null;
    status: "Ended" | "Returning Series" | "In Production" | "Canceled" | "Pilot" | "Planned";
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

export interface Episode {
    id: number;
    show_id: number;
    season: number;
    episode: number;
    path: string | null;
    title: string | null;
    overview: string | null;
    release_date: string | null;
    length: number | null;
    user_score: number | null;
    last_checked: string | null;
}