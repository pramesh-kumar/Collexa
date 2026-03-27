const router = require("express").Router();
const { discoverUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

router.get("/discover", authMiddleware, discoverUsers);

module.exports = router;
