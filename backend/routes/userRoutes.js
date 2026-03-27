const router = require("express").Router();
const { discoverUsers, blockUser, unblockUser, getBlockedUsers, getUserProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

router.get("/discover", authMiddleware, discoverUsers);
router.get("/blocked", authMiddleware, getBlockedUsers);
router.get("/profile/:userId", authMiddleware, getUserProfile);
router.post("/block/:userId", authMiddleware, blockUser);
router.post("/unblock/:userId", authMiddleware, unblockUser);

module.exports = router;
