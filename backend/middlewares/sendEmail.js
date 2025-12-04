import { Resend } from 'resend';

export const sendEMail = async (options) => {
    try {
        console.log("Sending email via Resend HTTP API...");

        const resend = new Resend(process.env.SMTP_PASS);

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: options.email,
            subject: options.subject,
            html: options.html,
            text: options.message
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw new Error(error.message);
        }

        console.log("Email sent successfully via Resend:", data.id);
        return data;
    } catch (error) {
        console.error("Error sending email:", {
            message: error.message,
            stack: error.stack
        });
        throw new Error(`Failed to send email: ${error.message}`);
    }
};