const router = require("express").Router();
const { getChatHistory } = require("../controllers/chatController");
const authMiddleware = require("../middleware/auth");

router.get("/:userId", authMiddleware, getChatHistory);

module.exports = router;
