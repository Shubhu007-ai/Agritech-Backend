const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (email, subject, content) => {
  await transporter.sendMail({
    from: '"AgriTech AI" <Agritechaiservices@gmail.com>',
    to: email,
    subject: subject,
    html: content
  });
};

module.exports = sendEmail;