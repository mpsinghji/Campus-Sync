import nodemailer from "nodemailer";

export const sendEMail = async (options) => {
    try {
        // Fix for Render/Network timeouts:
        // 1. Try 'smtp.googlemail.com' which sometimes bypasses blocks on 'smtp.gmail.com'
        // 2. Keep Port 587 and IPv4
        console.log("Creating email transporter with smtp.googlemail.com...");

        const transporter = nodemailer.createTransport({
            host: 'smtp.googlemail.com', // Alternative host
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            family: 4,
            logger: true,
            debug: true,
            connectionTimeout: 30000, // 30s is usually enough if it works
            greetingTimeout: 30000,
            socketTimeout: 30000,
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log("Preparing email options:", {
            from: process.env.SMTP_USER,
            to: options.email,
            subject: options.subject
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        console.log("Sending email...");
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", {
            message: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command
        });
        throw new Error(`Failed to send email: ${error.message}`);
    }
};


// export const sendOtpEmail = async (user, otp) => {
//     const emailTemplate = `
//       <html>
//         <body>
//           <h2>Verify your account</h2>
//           <p>Dear User,</p>
//           <p>Your OTP for verification is: <strong>${otp}</strong></p>
//           <p>The OTP will expire in 15 minutes.</p>
//         </body>
//       </html>
//     `;
  
//     const subject = "Verify your account";
  
//     try {
//       // Send OTP email using the sendEMail function
//       await sendEMail({
//         email: user.email,  // Recipient's email
//         subject: subject,   // Subject for the OTP email
//         html: emailTemplate, // HTML template for OTP email
//       });
//     } catch (error) {
//       console.error("Error sending OTP email:", error);
//     }
//   };