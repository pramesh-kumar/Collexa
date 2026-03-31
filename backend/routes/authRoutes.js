const router = require("express").Router();
const { signup, verifyOtp, login, deleteAccount, saveKeys, getMyKeys, forgotPassword, resetPassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.delete("/account", authMiddleware, deleteAccount);
router.post("/keys", authMiddleware, saveKeys);
router.get("/keys", authMiddleware, getMyKeys);

module.exports = router;
