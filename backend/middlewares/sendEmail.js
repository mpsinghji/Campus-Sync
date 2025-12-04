import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

export const sendEMail = async (options) => {
    try {
        console.log("Sending email via Gmail API (OAuth2)...");

        // Hardcoded credentials removed for security.
        // These must be set in your .env file and Render Environment Variables.
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

        const accessToken = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
                if (err) {
                    console.error("Failed to create access token :(", err);
                    reject("Failed to create access token");
                }
                resolve(token);
            });
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: USER_EMAIL,
                accessToken,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN
            }
        });

        const mailOptions = {
            from: USER_EMAIL,
            to: options.email,
            subject: options.subject,
            html: options.html,
            text: options.message
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully via Gmail API:", info.messageId);
        return info;

    } catch (error) {
        console.error("Error sending email:", {
            message: error.message,
            stack: error.stack
        });
        throw new Error(`Failed to send email: ${error.message}`);
    }
};