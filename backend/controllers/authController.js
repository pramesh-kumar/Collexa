const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Swipe = require("../models/Swipe");
const Match = require("../models/Match");
const Message = require("../models/Message");
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
    const { email, otp, name, course, branch, year, age } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp || user.otpExpiresAt < new Date())
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    if (name && branch && year && !isNaN(Number(year))) {
      const existing = await Profile.findOne({ userId: user._id });
      if (!existing) {
        await Profile.create({
          userId: user._id,
          name,
          course: course || "",
          branch,
          year: Number(year),
          age: age ? Number(age) : 18,
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

// DELETE /auth/account
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.userId;

    await Promise.all([
      User.findByIdAndDelete(userId),
      Profile.findOneAndDelete({ userId }),
      Swipe.deleteMany({ $or: [{ userId }, { targetUserId: userId }] }),
      Match.deleteMany({ $or: [{ user1: userId }, { user2: userId }] }),
      Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
    ]);

    res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    next(err);
  }
};

// POST /auth/keys — save user's public key + encrypted private key
const saveKeys = async (req, res, next) => {
  try {
    const { publicKey, encryptedPrivateKey } = req.body;
    await User.findByIdAndUpdate(req.userId, { publicKey, encryptedPrivateKey });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// GET /auth/keys — get own encrypted private key
const getMyKeys = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("publicKey encryptedPrivateKey");
    res.json({ success: true, publicKey: user.publicKey, encryptedPrivateKey: user.encryptedPrivateKey });
  } catch (err) { next(err); }
};

module.exports = { signup, verifyOtp, login, deleteAccount, saveKeys, getMyKeys };
