const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  profilePicture: { type: String, default: "" },
  coverPicture: { type: String, default: "" },
  bio: { type: String, default: "সব বন্ধু একসাথে - RMBD Hub member", maxlength: 150 },
  city: { type: String, default: "" },
  from: { type: String, default: "" },
  followers: { type: Array, default: [] },
  followings: { type: Array, default: [] },
  isAdmin: { type: Boolean, default: false },
  online: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
