const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  port: 587,
  secure: false,
});

const sendEmail = (email, subject, content) => {
  transporter.sendMail({
    from: '"AgriTech AI" <Agritechaiservices@gmail.com>',
    to: email,
    subject: subject,
    html: content
  })
  .then(() => console.log("Email sent"))
  .catch((err) => console.error("Email failed:", err));
};

module.exports = sendEmail;