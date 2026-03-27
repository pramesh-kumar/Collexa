const Profile = require("../models/Profile");
const Swipe = require("../models/Swipe");

// GET /users/discover?branch=CSE&year=2
const discoverUsers = async (req, res, next) => {
  try {
    const { branch, year } = req.query;

    const alreadySwiped = await Swipe.find({ userId: req.userId }).distinct("targetUserId");

    const filters = {
      userId: { $nin: [...alreadySwiped, req.userId] },
    };
    if (branch) filters.branch = branch;
    if (year) filters.year = Number(year);

    const users = await Profile.find(filters).limit(20).select("-__v");
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

module.exports = { discoverUsers };
