import { CreateEmailResponse, Resend } from "resend";
import { Config, MissingShow } from "../types/index.ts";
import Handlebars from "npm:handlebars";
import { source as missingShowTemplate } from "../templates/missingShows.ts";

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
	const template: HandlebarsTemplateDelegate = Handlebars.compile(missingShowTemplate);
	return template({ shows });
}
