import { configName } from "../variables/var.ts";
import { Config, LoadConfig, NoConfigValue, NotFoundError } from "../types/index.ts";
import { Path } from "@david/path";

function checkValue(value: string, valueName: string): void {
	if (!value || value === "") {
		throw new NoConfigValue(valueName);
	}
}

function createConfigFile(configPath: Path): void {
	// Create config file, because it does not exist
	const config: LoadConfig = {
		tmdb_key: "api key from your tmdb account",
		show_folder: "path-to-shows",
		database: "path-to-database",
		update_freq: "hours to keep cache",
		email: {
			email: "your@email.com",
			subject: "Subject for when you receive email",
			resend_key: "Make account at resend.com and enter api key here",
			send_email: false
		},
	};

	configPath.writeJsonPrettySync(config);
}

export function loadConfig(): Config {
	// Check if config file exists
	const configPath = new Path(configName);
	if (!configPath.existsSync()) {
		createConfigFile(configPath);
		throw new Error("Config file has been created, please fill up needed variables");
	}

	const tmp = configPath.readJsonSync() as LoadConfig;

	if (!tmp) {
		throw new NotFoundError({ cause: "NotFound", message: "Config file does not exist, or is invalid" });
	}

	// Check all values to exist
	checkValue(tmp.update_freq, "update_freq");
	checkValue(tmp.tmdb_key, "tmdb_key");
	checkValue(tmp.show_folder, "show_folder");
	checkValue(tmp.database, "database");

	// Check email
	if (!tmp.email) throw new NoConfigValue("config.email");
	checkValue(tmp.email.email, "email.email");
	checkValue(tmp.email.resend_key, "email.resend_key");
	checkValue(tmp.email.subject, "email.subject");
	checkValue(tmp.email.send_email.toString(), 'email.send_email');

	const config: Config = {
		...tmp,
		update_freq: parseFloat(tmp.update_freq),
	};

	return config;
}
