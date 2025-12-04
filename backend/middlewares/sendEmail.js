import nodemailer from "nodemailer";

export const sendEMail = async (options) => {
    try {
        // Fix for Render deployment where port might be set to 507 incorrectly
        const smtpPort = process.env.SMTP_PORT == 507 ? 465 : (process.env.SMTP_PORT || 465);
        const isSecure = smtpPort == 465;

        console.log("Creating email transporter with config:", {
            host: process.env.SMTP_HOST,
            port: smtpPort,
            service: process.env.SMTP_SERVICE,
            user: process.env.SMTP_USER
        });

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: smtpPort,
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            secure: isSecure
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