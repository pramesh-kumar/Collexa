const router = require("express").Router();
const { signup, verifyOtp, login, deleteAccount } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;
