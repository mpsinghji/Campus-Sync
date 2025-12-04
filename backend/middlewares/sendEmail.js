import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

export const sendEMail = async (options) => {
    try {
        console.log("Sending email via Gmail HTTP API...");

        const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
        const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
        const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
        const USER_EMAIL = process.env.GMAIL_USER_EMAIL;

        const oauth2Client = new OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Construct the email in MIME format
        const subject = options.subject;
        const to = options.email;
        const from = USER_EMAIL;
        const body = options.html || options.message;

        // Encode subject to handle special characters
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

        const messageParts = [
            `From: <${from}>`,
            `To: <${to}>`,
            `Subject: ${utf8Subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=utf-8`,
            `Content-Transfer-Encoding: 7bit`,
            ``,
            body
        ];

        const message = messageParts.join('\n');

        // Encode the message to base64url (required by Gmail API)
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        console.log("Email sent successfully via Gmail HTTP API:", res.data.id);
        return res.data;

    } catch (error) {
        console.error("Error sending email:", {
            message: error.message,
            stack: error.stack,
            response: error.response ? error.response.data : null
        });
        throw new Error(`Failed to send email: ${error.message}`);
    }
};