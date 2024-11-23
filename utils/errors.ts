import { DisplayErrorProps } from "../types/index.ts";

export function displayError(error: DisplayErrorProps) {
	console.error(`Error appeared when: ${error.when}`);
	console.error(error.message);
}
