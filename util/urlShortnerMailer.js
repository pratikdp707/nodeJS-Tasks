var nodemailer = require("nodemailer");
require('dotenv').config();
const sendEmail = async (email, emailMessage) => {
  try {
    const transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SENDER_MAIL_ID,
        pass: process.env.SENDER_MAIL_PASSWORD,
      },
    });

    console.log(transporter);

    if (transporter) {
      const mailOptions = {
        from: process.env.SENDER_MAIL_ID,
        to: email,
        subject: "Account verification for URL Shortner Website",
        html: emailMessage,
      };

      const result = await transporter.sendMail(mailOptions);
      return result;
    }
  } catch (e) {
    console.log("error in sending mail -> ", e);
  }
};



module.exports = sendEmail;