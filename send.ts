// First, install the Resend SDK for Deno
import { Resend } from "npm:resend";

// Initialize with your API key
// Get one at https://resend.com/api-keys
const resend = new Resend("re_dYSbr1GQ_JWrZgAQveVWBrbCAhQs25BXC");

try {
	const data = await resend.emails.send({
		from: "onboarding@resend.dev",
		to: "skrazzo@proton.me",
		subject: "Hello World",
		html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
	});

	console.log("Email sent successfully:", data);
} catch (error) {
	console.error("Failed to send email:", error);
}
