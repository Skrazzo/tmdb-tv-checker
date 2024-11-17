export function displayError(error: Error) {
	console.error(`Error appeared when: ${error.when}`);
	console.error(error.message);

	if (error.exit) Deno.exit(1);
}

export interface Error {
	when: string; // Describe when error happened "fetching api"
	message: unknown;
	exit?: boolean;
}

export interface Config {
	tmdb_key: string | null;
	show_folder: string | null;
}
