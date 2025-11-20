// import { resend } from "@/lib/resend";
// import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

// export async function sendVerificationEmail(
//   email: string,
//   username: string,
//   verifyCode: string
// ): Promise<ApiResponse> {
//   try {
//     await resend.emails.send({
//       from: "onboarding@resend.dev",
//       to: email,
//       subject: "Mystery Message Verification Code",
//       react: VerificationEmail({ username, otp: verifyCode }),
//     });
//     return { success: true, message: "Verification email sent successfully." };
//   } catch (emailError) {
//     console.error("Error sending verification email:", emailError);
//     return { success: false, message: "Failed to send verification email." };
//   }
// }

// /helpers/sendVerificationEmail.js
import nodemailer from "nodemailer";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your Gmail address
        pass: process.env.GMAIL_APP_PASS, // your 16-char App Password
      },
    });

    // Email content (HTML + plain text)
    const mailOptions = {
      from: `"Mystery Message App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Hello ${username}, your verification code is: ${verifyCode}`,
      html: `<p>Hello <strong>${username}</strong>,</p>
             <p>Your verification code is: <strong>${verifyCode}</strong></p>
             <p>This code expires in 1 hour.</p>`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return { success: true, message: "Verification email sent successfully." };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, message: "Failed to send verification email" };
  }
}
