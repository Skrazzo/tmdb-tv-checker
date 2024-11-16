import { loadConfig } from "./functions/loadConfig.ts";
import { displayError } from "./types/dataHandling.ts";

// Load config file
try {
	await loadConfig();
} catch (err) {
	displayError({
		when: "Loading config file from main.ts",
		message: err,
		exit: true,
	});
}
