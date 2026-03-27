const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOTP } = require("../config/mailer");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /auth/signup
const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email.includes("iitmandi.ac.in"))
      return res.status(400).json({ success: false, message: "Only IIT Mandi email addresses are allowed" });

    const existing = await User.findOne({ email });
    if (existing?.isVerified)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await User.findOneAndUpdate(
      { email },
      { email, password: hashed, otp, otpExpiresAt, isVerified: false },
      { upsert: true, new: true }
    );

    await sendOTP(email, otp);
    if (process.env.NODE_ENV === "development") console.log(`🔑 DEV OTP for ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    next(err);
  }
};

// POST /auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, name, course, branch, year } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp || user.otpExpiresAt < new Date())
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Auto-create profile if fields provided
    if (name && branch && year && !isNaN(Number(year))) {
      const Profile = require("../models/Profile");
      const existing = await Profile.findOne({ userId: user._id });
      if (!existing) {
        await Profile.create({
          userId: user._id,
          name,
          course: course || "",
          branch,
          year: Number(year),
          age: 18,
          bio: "",
          interests: [],
        });
      }
    }

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isVerified)
      return res.status(401).json({ success: false, message: "Account not found or not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, verifyOtp, login };
