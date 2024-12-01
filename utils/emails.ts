import { CreateEmailResponse, Resend } from "resend";
import { Config, MissingShow } from "../types/index.ts";
import Handlebars from "npm:handlebars";
import { Path } from "@david/path";
import { NotFoundError } from "../types/errors.ts";

export async function sendEmail(config: Config["email"], html: string): Promise<CreateEmailResponse> {
	const resend = new Resend(config.resend_key);

	try {
		const data: CreateEmailResponse = await resend.emails.send({
			from: "onboarding@resend.dev",
			to: config.email,
			subject: config.subject,
			html: html,
		});

		return data;
	} catch (err) {
		throw new Error("Error while sending email to " + config.email + " " + err);
	}
}

export function generateHTML(shows: MissingShow[]): string {
	// Load template for missing shows
	const templatePath = new Path("templates/missingShows.html");
	if (!templatePath.existsSync()) {
		throw new NotFoundError({
			cause: "Could not find template for missing shows",
			message: "while trying to generate html for email",
		});
	}

	const source: string = templatePath.readTextSync();
	const template: HandlebarsTemplateDelegate = Handlebars.compile(source);
	return template({ shows });
}
