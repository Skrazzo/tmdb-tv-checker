import { readJsonSync, writeJsonSync } from "https://deno.land/x/jsonfile/mod.ts";
import { configName } from "../variables/var.ts";
import { Config } from "../types/index.ts";
import { displayError } from "./errors.ts";

function isValidConfig(config: unknown): config is Record<string, string> {
	if (typeof config !== "object") return false;
	if (!config) return false;

	let valid: boolean = true;
	const configRecord = config as Record<string, string>;
	const keys = Object.keys(configRecord);

	keys.forEach((key) => {
		if (!(key in configRecord)) {
			valid = false;
			console.log("invalid 1");
		}

		if (configRecord[key] === undefined || configRecord[key] === "") {
			valid = false;
			console.log("invalid 2");
		}
	});

	return valid;
}

export function loadConfig(): Config | null {
	try {
		const tmp = readJsonSync(configName) as Record<string, string>;

		if (tmp === null) {
			displayError({ when: "After parsing config file", message: "Config file is non-existent" });
			return null;
		}

		if (!isValidConfig(tmp)) {
			displayError({ when: "Validating config file", message: "Config file is not correct" });
		}

		const config: Config = {
			tmdb_key: tmp.tmdb_key || null,
			show_folder: tmp.show_folder || null,
			database: tmp.database || null,
		};
		return config;
	} catch (err) {
		if (!(err instanceof Deno.errors.NotFound)) {
			displayError({ when: "Trying to open config file", message: `Unexpected error -> ${err}` });
		}

		// Create config file, because it does not exist
		const config: Config = {
			tmdb_key: "api key from your tmdb account",
			show_folder: "path-to-shows",
			database: "path-to-database"
		};

		try {
			writeJsonSync(configName, config);
		} catch (err) {
			displayError({
				when: "Writing config file",
				message: err
			});
		}

		// Display error
		displayError({
			when: "loading config file",
			message: "Config file has been created, please fill up needed variables"
		});
		return null;
	}
}
