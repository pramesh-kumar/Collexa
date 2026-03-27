const Swipe = require("../models/Swipe");
const Match = require("../models/Match");

// POST /swipe
const swipe = async (req, res, next) => {
  try {
    const { targetUserId, action } = req.body;

    if (targetUserId === req.userId)
      return res.status(400).json({ success: false, message: "Cannot swipe yourself" });

    await Swipe.findOneAndUpdate(
      { userId: req.userId, targetUserId },
      { action },
      { upsert: true, new: true }
    );

    let matched = false;
    if (action === "like") {
      const theyLikedMe = await Swipe.findOne({ userId: targetUserId, targetUserId: req.userId, action: "like" });
      if (theyLikedMe) {
        const existingMatch = await Match.findOne({
          $or: [
            { user1: req.userId, user2: targetUserId },
            { user1: targetUserId, user2: req.userId },
          ],
        });
        if (!existingMatch) {
          await Match.create({ user1: req.userId, user2: targetUserId });
          matched = true;
        }
      }
    }

    res.json({ success: true, matched });
  } catch (err) {
    next(err);
  }
};

module.exports = { swipe };
