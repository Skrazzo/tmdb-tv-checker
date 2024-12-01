import { CreateEmailResponse, Resend } from "resend";
import { Config } from "../types/index.ts";

export async function sendEmail(config: Config['email'], html: string): Promise<CreateEmailResponse> {
    const resend = new Resend(config.resend_key);

    try {
        const data: CreateEmailResponse = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: config.email,
            subject: config.subject,
            html: html,
        });

        return data;
    } catch( err) {
        throw new Error('Error while sending email to ' + config.email + ' ' + err);
    }
}