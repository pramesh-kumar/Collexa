const router = require("express").Router();
const { createProfile, getMyProfile, updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/auth");
const { upload } = require("../middleware/upload");

router.post("/create", authMiddleware, upload.array("photos", 5), createProfile);
router.get("/me", authMiddleware, getMyProfile);
router.put("/update", authMiddleware, upload.array("photos", 5), updateProfile);

module.exports = router;
