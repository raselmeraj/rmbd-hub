const router = require('express').Router();
const { Conversation, Message } = require('../models/Message');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json('No token');
  try { const d = jwt.verify(token, process.env.JWT_SECRET); req.userId = d.id; next(); }
  catch { res.status(403).json('Invalid'); }
};

// New Conversation
router.post('/', auth, async (req, res) => {
  const newConv = new Conversation({ members: [req.userId, req.body.receiverId] });
  try { const saved = await newConv.save(); res.status(200).json(saved); }
  catch (err) { res.status(500).json(err); }
});

router.get('/:userId', auth, async (req, res) => {
  try {
    const conv = await Conversation.find({ members: { $in: [req.params.userId] } });
    res.status(200).json(conv);
  } catch (err) { res.status(500).json(err); }
});

// Add Message - Real DB
router.post('/message', auth, async (req, res) => {
  const newMessage = new Message({ conversationId: req.body.conversationId, sender: req.userId, text: req.body.text });
  try {
    const saved = await newMessage.save();
    await Conversation.findByIdAndUpdate(req.body.conversationId, { lastMessage: req.body.text });
    res.status(200).json(saved);
  } catch (err) { res.status(500).json(err); }
});

router.get('/message/:conversationId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId });
    res.status(200).json(messages);
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;
