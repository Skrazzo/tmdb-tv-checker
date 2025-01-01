import { configName } from "../variables/var.ts";
import { Config, LoadConfig, NoConfigValue, NotFoundError } from "../types/index.ts";
import { Path } from "@david/path";

function checkValue(value: string | number | boolean | string[], valueName: string): void {
	if (typeof value === "undefined") throw new NoConfigValue(valueName);

	if (Array.isArray(value)) {
		if (value.length === 0) throw new NoConfigValue(valueName);
		value.forEach((item) => {
			if (item.toString() === "") throw new NoConfigValue(`${valueName}[${item}]`);
		});
	} else {
		const tmp: string = value.toString();
		if (tmp === "") throw new NoConfigValue(valueName);
	}
}

// changed to better represent a "default" config
function createConfigFile(configPath: Path): void {
	const config: LoadConfig = {
		tmdb_key: "api key from your tmdb account",
		show_folders: ["path-to-shows-1", "path-to-shows-2..."],
		database: "database.sqlite",
		update_freq: "24",
		email: {
			email: "your@email.com",
			subject: "Show checker update",
			resend_key: "Make account at resend.com and enter api key here",
			send_email: false,
		},
	};

	configPath.writeJsonPrettySync(config);
}

export function loadConfig(): Config {
	const configPath = new Path(configName);
	if (!configPath.existsSync()) {
		createConfigFile(configPath);
		throw new Error("Config file has been created, please fill up needed variables");
	}

	const tmp = configPath.readJsonSync() as LoadConfig;

	if (!tmp) {
		throw new NotFoundError({ cause: "NotFound", message: "Config file does not exist, or is invalid" });
	}

	checkValue(tmp.update_freq, "update_freq");
	checkValue(tmp.tmdb_key, "tmdb_key");
	checkValue(tmp.show_folders, "show_folders");
	checkValue(tmp.database, "database");

	if (!tmp.email) throw new NoConfigValue("config.email");
	checkValue(tmp.email.email, "email.email");
	checkValue(tmp.email.resend_key, "email.resend_key");
	checkValue(tmp.email.subject, "email.subject");
	checkValue(tmp.email.send_email, "email.send_email");

	const config: Config = {
		...tmp,
		update_freq: parseFloat(tmp.update_freq),
	};

	return config;
}
