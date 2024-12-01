import { readJsonSync, writeJsonSync } from "https://deno.land/x/jsonfile/mod.ts";
import { configName } from "../variables/var.ts";
import { Config, NoConfigValue, NotFoundError } from "../types/index.ts";

function checkValue(value: string, valueName: string): void {
	if (!value || value === "") {
		throw new NoConfigValue(valueName);
	}
}

export function loadConfig(): Config {
	try {
		const tmp = readJsonSync(configName) as Record<string, string>;

		if (!tmp) {
			throw new NotFoundError({ cause: "NotFound", message: "Config file does not exist, or is invalid" });
		}

		// TODO: Check email config

		// Check all values to exist
		checkValue(tmp.update_freq, "update_freq");
		checkValue(tmp.tmdb_key, "tmdb_key");
		checkValue(tmp.show_folder, "show_folder");
		checkValue(tmp.database, "database");

		const config: Config = {
			tmdb_key: tmp.tmdb_key,
			show_folder: tmp.show_folder,
			database: tmp.database,
			update_freq: parseFloat(tmp.update_freq),
		};
		return config;
	} catch (err) {
		if (!(err instanceof Deno.errors.NotFound)) {
			console.error("Unexpected error happened while trying to load config");
			console.error(err);
			Deno.exit(1);
		}

		// Create config file, because it does not exist
		const config: Config = {
			tmdb_key: "api key from your tmdb account",
			show_folder: "path-to-shows",
			database: "path-to-database",
			update_freq: 24,
		};

		try {
			writeJsonSync(configName, config);
		} catch (err) {
			console.error(`Error while writing new config file: ${err}`);
		}

		console.error("Config file has been created, please fill up needed variables");
		Deno.exit(1);
	}
}
