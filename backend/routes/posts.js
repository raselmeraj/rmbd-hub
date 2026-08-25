const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// CREATE POST - Real DB
router.post('/', authMiddleware, async (req, res) => {
  const newPost = new Post({ userId: req.userId, desc: req.body.desc, img: req.body.img });
  try {
    const saved = await newPost.save();
    res.status(201).json(saved);
  } catch (err) { res.status(500).json(err); }
});

// TIMELINE - Real feed: everyone sees each other's posts
router.get('/timeline/all', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const userPosts = await Post.find({ userId: currentUser._id }).populate('userId', 'username profilePicture');
    const friendPosts = await Promise.all(
      currentUser.followings.map(friendId => {
        return Post.find({ userId: friendId }).populate('userId', 'username profilePicture');
      })
    );
    // For demo: also include all posts to show Real DB concept - everyone sees everyone
    const allPosts = await Post.find().populate('userId', 'username profilePicture').sort({ createdAt: -1 }).limit(50);
    res.json(allPosts);
  } catch (err) { res.status(500).json(err); }
});

// LIKE / UNLIKE - Real DB update
router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.userId)) {
      await post.updateOne({ $push: { likes: req.userId } });
      res.status(200).json({ liked: true, count: post.likes.length + 1 });
    } else {
      await post.updateOne({ $pull: { likes: req.userId } });
      res.status(200).json({ liked: false, count: post.likes.length - 1 });
    }
  } catch (err) { res.status(500).json(err); }
});

// COMMENT - Real DB
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const post = await Post.findById(req.params.id);
    const comment = {
      userId: req.userId,
      username: user.username,
      profilePicture: user.profilePicture,
      text: req.body.text
    };
    post.comments.push(comment);
    await post.save();
    res.status(200).json(post.comments[post.comments.length - 1]);
  } catch (err) { res.status(500).json(err); }
});

router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;
