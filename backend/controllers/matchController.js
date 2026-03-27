const Match = require("../models/Match");
const Profile = require("../models/Profile");

// GET /matches
const getMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      $or: [{ user1: req.userId }, { user2: req.userId }],
    });

    const matchedUserIds = matches.map((m) =>
      m.user1.toString() === req.userId ? m.user2 : m.user1
    );

    const profiles = await Profile.find({ userId: { $in: matchedUserIds } }).select("-__v");
    res.json({ success: true, matches: profiles });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMatches };
