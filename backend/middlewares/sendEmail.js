import nodemailer from "nodemailer";

export const sendEMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        secure: true
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
}


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
  