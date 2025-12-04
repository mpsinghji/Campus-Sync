import nodemailer from "nodemailer";

export const sendEMail = async (options) => {
    try {
        // Fix for Render/Network timeouts:
        // 1. Explicitly use smtp.gmail.com on Port 587 (STARTTLS)
        // 2. Force IPv4
        // 3. Increase timeouts significantly (60s) to handle slow networks
        console.log("Creating email transporter with explicit config (587/IPv4)...");

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            // Network settings
            family: 4, // Force IPv4
            logger: true,
            debug: true,
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000, // 30 seconds
            socketTimeout: 60000, // 60 seconds
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