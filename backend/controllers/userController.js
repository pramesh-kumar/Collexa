const Profile = require("../models/Profile");
const Swipe = require("../models/Swipe");
const User = require("../models/User");

// GET /users/discover
const discoverUsers = async (req, res, next) => {
  try {
    const { branch, year, college } = req.query;

    const currentUser = await User.findById(req.userId).select("blockedUsers");
    const alreadySwiped = await Swipe.find({ userId: req.userId }).distinct("targetUserId");

    const excluded = [...alreadySwiped, req.userId, ...(currentUser.blockedUsers || [])];

    const filters = { userId: { $nin: excluded } };
    if (branch) filters.branch = branch;
    if (year) filters.year = Number(year);
    if (college) filters.college = college;

    const users = await Profile.find(filters).limit(20).select("-__v");
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// POST /users/block/:userId
const blockUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { blockedUsers: req.params.userId },
    });
    res.json({ success: true, message: "User blocked" });
  } catch (err) {
    next(err);
  }
};

// POST /users/unblock/:userId
const unblockUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $pull: { blockedUsers: req.params.userId },
    });
    res.json({ success: true, message: "User unblocked" });
  } catch (err) {
    next(err);
  }
};

// GET /users/blocked
const getBlockedUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("blockedUsers");
    const profiles = await Profile.find({ userId: { $in: user.blockedUsers } }).select("name profilePhotos userId");
    res.json({ success: true, blocked: profiles });
  } catch (err) {
    next(err);
  }
};

// GET /users/profile/:userId
const getUserProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).select("-__v");
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// GET /users/key/:userId — get someone's public key
const getUserPublicKey = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("publicKey");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, publicKey: user.publicKey });
  } catch (err) { next(err); }
};

module.exports = { discoverUsers, blockUser, unblockUser, getBlockedUsers, getUserProfile, getUserPublicKey };
