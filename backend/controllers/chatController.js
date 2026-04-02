const Message = require("../models/Message");
const Match = require("../models/Match");
const { uploadChatFileToS3 } = require("../middleware/upload");

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
      deletedFor: { $ne: req.userId },
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

// POST /chat/:userId/upload
const uploadChatFile = async (req, res, next) => {
  try {
    const { userId: targetId } = req.params;
    const matched = await isMatched(req.userId, targetId);
    if (!matched) return res.status(403).json({ success: false, message: "Not matched" });

    const file = req.file;
    const fileUrl = await uploadChatFileToS3(file);

    let type = "file";
    if (file.mimetype.startsWith("image/")) type = "image";
    else if (file.mimetype.startsWith("audio/")) type = "audio";

    const message = await Message.create({
      senderId: req.userId,
      receiverId: targetId,
      type,
      fileUrl,
      fileName: file.originalname,
      text: "",
    });

    const { io } = require("../server");
    io.to(targetId.toString()).emit("newMessage", message.toJSON());

    res.json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// DELETE /chat/:userId/clear
const clearChat = async (req, res, next) => {
  try {
    const { userId: targetId } = req.params;
    const matched = await isMatched(req.userId, targetId);
    if (!matched) return res.status(403).json({ success: false, message: "Not matched" });

    await Message.updateMany(
      {
        $or: [
          { senderId: req.userId, receiverId: targetId },
          { senderId: targetId, receiverId: req.userId },
        ],
        deletedFor: { $ne: req.userId },
      },
      { $addToSet: { deletedFor: req.userId } }
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// GET /chat/unread-counts
const getUnreadCounts = async (req, res, next) => {
  try {
    const counts = await Message.aggregate([
      { $match: { receiverId: new (require("mongoose").Types.ObjectId)(req.userId), seenBy: { $ne: new (require("mongoose").Types.ObjectId)(req.userId) }, deletedFor: { $ne: new (require("mongoose").Types.ObjectId)(req.userId) } } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);
    const result = {};
    counts.forEach(({ _id, count }) => { result[_id.toString()] = count; });
    res.json({ success: true, unreadCounts: result });
  } catch (err) { next(err); }
};

module.exports = { getChatHistory, uploadChatFile, clearChat, isMatched, getUnreadCounts };
