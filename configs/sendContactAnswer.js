const nodemailer = require("nodemailer");

const sendOtpEmail = (toEmail, fullName, subject, replyMessage) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_NAME_EMAIL,
      pass: process.env.PASSWORD_EMAIL,
    },
  });

  const mailOption = {
    from: process.env.USER_NAME_EMAIL,
    to: toEmail,
    subject: `Response to Your Message: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello ${fullName},</h2>
        <p>Thank you for contacting us. We have reviewed your message and here is our response:</p>
        
        <blockquote style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #007bff;">
          ${replyMessage}
        </blockquote>

        <p>If you have any further questions, feel free to reply to this email.</p>
        <p>Best regards,<br/>Support Team</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOption);
};

module.exports = sendOtpEmail;
