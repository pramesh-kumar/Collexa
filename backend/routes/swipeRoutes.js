const router = require("express").Router();
const { swipe } = require("../controllers/swipeController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, swipe);

module.exports = router;
