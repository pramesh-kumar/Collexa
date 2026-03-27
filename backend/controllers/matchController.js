const Match = require("../models/Match");
const Profile = require("../models/Profile");
const User = require("../models/User");

// GET /matches
const getMatches = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.userId).select("blockedUsers");
    const blocked = currentUser.blockedUsers || [];

    const matches = await Match.find({
      $or: [{ user1: req.userId }, { user2: req.userId }],
    });

    const matchedUserIds = matches
      .map((m) => m.user1.toString() === req.userId ? m.user2 : m.user1)
      .filter((id) => !blocked.some((b) => b.toString() === id.toString()));

    const profiles = await Profile.find({ userId: { $in: matchedUserIds } }).select("-__v");
    const result = profiles.map((p) => ({ ...p.toObject(), userId: p.userId }));
    res.json({ success: true, matches: result });
  } catch (err) {
    next(err);
  }
};

// DELETE /matches/:userId
const removeMatch = async (req, res, next) => {
  try {
    const other = req.params.userId;
    await Match.findOneAndDelete({
      $or: [
        { user1: req.userId, user2: other },
        { user1: other, user2: req.userId },
      ],
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMatches, removeMatch };
