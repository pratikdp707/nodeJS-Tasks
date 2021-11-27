var nodemailer = require("nodemailer");
require('dotenv').config();
const mailerFunc = async (toAddress, resetPassLongString) => {
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
        to: toAddress,
        subject: "Password Reset Code",
        text: `Do not share your reset code with Others,  Click here to change Password-    
            ${process.env.RESET_URL}/${resetPassLongString} `,
      };

      const result = await transporter.sendMail(mailOptions);
      return result;
    }
  } catch (e) {
    console.log("error in sending mail -> ", e);
  }
};



module.exports = mailerFunc;