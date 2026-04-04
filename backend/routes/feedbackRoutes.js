const router = require("express").Router();
const authMiddleware = require("../middleware/auth");
const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Profile = require("../models/Profile");
const { transporter } = require("../config/mailer");

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { category, message } = req.body;
    if (!category || !message?.trim()) return res.status(400).json({ success: false, message: "All fields required" });

    const [user, profile] = await Promise.all([
      User.findById(req.userId).select("email"),
      Profile.findOne({ userId: req.userId }).select("name"),
    ]);
    await Feedback.create({ userId: req.userId, category, message });

    await transporter.sendMail({
      from: `"Collexa Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `[${category}] New Feedback — Collexa`,
      html: `<p><b>From:</b> ${profile?.name || "Unknown"} (${user?.email})</p><p><b>Category:</b> ${category}</p><p><b>Message:</b><br/>${message}</p>`,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
