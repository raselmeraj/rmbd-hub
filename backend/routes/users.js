const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json('No token');
  try { const d = jwt.verify(token, process.env.JWT_SECRET); req.userId = d.id; next(); }
  catch { res.status(403).json('Invalid'); }
};

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) { res.status(500).json(err); }
});

router.put('/:id/follow', auth, async (req, res) => {
  if (req.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.userId);
      if (!user.followers.includes(req.userId)) {
        await user.updateOne({ $push: { followers: req.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json('Followed - Real DB');
      } else {
        await user.updateOne({ $pull: { followers: req.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json('Unfollowed');
      }
    } catch (err) { res.status(500).json(err); }
  } else { res.status(403).json('Cant follow yourself'); }
});

router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({ username: { $regex: req.params.query, $options: 'i' } }).limit(10);
    res.json(users.map(u => { const { password, ...o } = u._doc; return o; }));
  } catch (e) { res.status(500).json(e); }
});

module.exports = router;
