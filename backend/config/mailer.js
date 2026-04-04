const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (to, otp) => {
  await transporter.sendMail({
    from: `"Collexa" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Collexa OTP",
    html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
};

module.exports = { sendOTP, transporter };
