import { assertEquals } from "@std/assert";
import { Config, NoConfigValue } from "../types/index.ts";
import { sendEmail } from "../utils/emails.ts";
import { loadConfig } from "../utils/loadConfig.ts";


const config: Config = loadConfig();

Deno.test('Api key exists and is correct', () => {
    if(!config.email.resend_key || config.email.resend_key === "") {
        throw new NoConfigValue('config.email.resend_key');
    }

    const resend_key_regex = /^re_\w+/gi;
    const matches = config.email.resend_key.match(resend_key_regex);
    if (!matches) {
        throw new Error("Invalid resend key detected");
    }

    assertEquals(matches.length, 1);
});

Deno.test('Send emails with resend and handlebars', async () => {
    console.log(`Sending test email to ${config.email.email} address...`);
    const emailResponse = await sendEmail(config.email, 'This is test email, to see if api key is correct');
    console.log(`Sent email data:`);
    console.log(emailResponse);

    assertEquals(emailResponse.error, null);
});
