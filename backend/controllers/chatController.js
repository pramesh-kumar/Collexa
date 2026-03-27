const Message = require("../models/Message");
const Match = require("../models/Match");

const isMatched = async (userId, targetId) => {
  return Match.findOne({
    $or: [
      { user1: userId, user2: targetId },
      { user1: targetId, user2: userId },
    ],
  });
};

// GET /chat/:userId
const getChatHistory = async (req, res, next) => {
  try {
    const { userId: targetId } = req.params;

    const matched = await isMatched(req.userId, targetId);
    if (!matched) return res.status(403).json({ success: false, message: "Not matched" });

    const messages = await Message.find({
      $or: [
        { senderId: req.userId, receiverId: targetId },
        { senderId: targetId, receiverId: req.userId },
      ],
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

module.exports = { getChatHistory, isMatched };
