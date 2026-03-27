const Profile = require("../models/Profile");
const { uploadToS3 } = require("../middleware/upload");

// POST /profile/create
const createProfile = async (req, res, next) => {
  try {
    const existing = await Profile.findOne({ userId: req.userId });
    if (existing) return res.status(400).json({ success: false, message: "Profile already exists" });

    const photoUrls = req.files?.length
      ? await Promise.all(req.files.map(uploadToS3))
      : [];

    const profile = await Profile.create({
      userId: req.userId,
      ...req.body,
      interests: req.body.interests ? JSON.parse(req.body.interests) : [],
      profilePhotos: photoUrls,
    });

    res.status(201).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// GET /profile/me
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

// PUT /profile/update
const updateProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.body.interests) updates.interests = JSON.parse(req.body.interests);

    if (req.files?.length) {
      const newPhotos = await Promise.all(req.files.map(uploadToS3));
      const existing = await Profile.findOne({ userId: req.userId });
      updates.profilePhotos = [...(existing?.profilePhotos || []), ...newPhotos];
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      updates,
      { new: true }
    );

    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProfile, getMyProfile, updateProfile };
