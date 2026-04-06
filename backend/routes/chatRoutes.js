const router = require("express").Router();
const { getChatHistory, uploadChatFile, clearChat, getUnreadCounts, downloadChatFile } = require("../controllers/chatController");
const authMiddleware = require("../middleware/auth");
const { chatUpload } = require("../middleware/upload");

router.get("/unread-counts", authMiddleware, getUnreadCounts);
router.get("/download", authMiddleware, downloadChatFile);
router.get("/:userId", authMiddleware, getChatHistory);
router.post("/:userId/upload", authMiddleware, chatUpload.single("file"), uploadChatFile);
router.delete("/:userId/clear", authMiddleware, clearChat);

module.exports = router;
