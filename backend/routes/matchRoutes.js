const router = require("express").Router();
const { getMatches, removeMatch } = require("../controllers/matchController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getMatches);
router.delete("/:userId", authMiddleware, removeMatch);

module.exports = router;
