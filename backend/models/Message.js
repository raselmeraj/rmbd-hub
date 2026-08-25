const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  members: { type: Array, required: true },
  lastMessage: { type: String },
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  seen: { type: Boolean, default: false }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.model('Message', MessageSchema);

module.exports = { Conversation, Message };
