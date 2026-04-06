const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  college: { type: String, required: true },
  course: { type: String, default: "" },
  branch: { type: String, required: true },
  year: { type: Number, required: true },
  gender: { type: String, default: "" },
  bio: { type: String, default: "" },
  interests: [{ type: String }],
  profilePhotos: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
