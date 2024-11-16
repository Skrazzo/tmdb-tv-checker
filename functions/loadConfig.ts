import {
	readJsonSync,
	writeJsonSync,
} from "https://deno.land/x/jsonfile/mod.ts";
import { configName } from "../variables/var.ts";
import { Config, displayError } from "../types/dataHandling.ts";

export async function loadConfig() {
	try {
		// Write config to global variable
		const config = readJsonSync(configName);
		globalThis.hello = config;
	} catch (err) {
		if (!(err instanceof Deno.errors.NotFound)) {
			throw err;
		}

		// Create config file, because it does not exist
		const config: Config = {
			tmdb_key: "api key from your tmdb account",
			show_folder: "path-to-shows",
		};

		try {
			writeJsonSync(configName, config);
		} catch (err) {
			displayError({
				when: "Writing config file",
				message: err,
				exit: true,
			});
		}

		// Display error
		displayError({
			when: "loading config file",
			message:
				"Config file has been created, please fill up needed variables",
			exit: true,
		});
	}
}
