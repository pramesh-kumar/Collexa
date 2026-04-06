const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (to, otp, type = "verify") => {
  const isReset = type === "reset";
  const subject = isReset ? "Reset your Collexa password" : "Verify your Collexa email";
  const heading = isReset ? "Password Reset Request" : "Verify Your Email";
  const subtext = isReset
    ? "We received a request to reset your password. Use the code below:"
    : "Welcome to Collexa! Use the code below to verify your email:";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fff0f3;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff0f3;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(244,63,94,0.10);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f43f5e,#ec4899);padding:36px 40px 28px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">💘</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Collexa</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Where IITians connect</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <h2 style="margin:0 0 8px;color:#1f2937;font-size:20px;font-weight:700;">${heading}</h2>
            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">${subtext}</p>
            <!-- OTP Box -->
            <div style="background:linear-gradient(135deg,#fff0f3,#fce7f3);border:2px solid #fda4af;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your verification code</p>
              <div style="font-size:42px;font-weight:900;letter-spacing:10px;color:#f43f5e;font-family:'Courier New',monospace;">${otp}</div>
            </div>
            <p style="margin:0 0 6px;color:#6b7280;font-size:13px;text-align:center;">⏱ This code expires in <b style="color:#1f2937;">10 minutes</b>.</p>
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#fdf2f8;padding:20px 40px;text-align:center;border-top:1px solid #fce7f3;">
            <p style="margin:0;color:#d1d5db;font-size:12px;">Made with 💘 by <b style="color:#f43f5e;">pms</b> &nbsp;·&nbsp; IIT Mandi</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Collexa 💘" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendOTP, transporter };
