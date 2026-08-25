const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  profilePicture: { type: String },
  text: { type: String, required: true, maxlength: 500 },
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  desc: { type: String, maxlength: 1000 },
  img: { type: String },
  likes: { type: Array, default: [] },
  comments: [CommentSchema],
  shares: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
