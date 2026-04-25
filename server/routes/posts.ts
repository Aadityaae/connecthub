import express from "express";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import Post from "../models/Post";
import User from "../models/User";
import Comment from "../models/Comment";
import mongoose from "mongoose";
import { demoPosts, demoUsers, demoComments, generateId } from "../lib/demoStore";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/posts
router.post("/", protect, async (req: AuthRequest, res) => {
  try {
    const { content, image } = req.body;

    if (!isDbConnected()) {
      const user = demoUsers.find(u => u._id === req.user?.id);
      const post = {
        _id: generateId(),
        author: {
          _id: user?._id,
          username: user?.username,
          profilePicture: user?.profilePicture
        },
        content,
        image,
        likes: [],
        comments: [],
        createdAt: new Date()
      };
      demoPosts.push(post);
      return res.status(201).json(post);
    }

    const post = await Post.create({
      author: req.user?.id,
      content,
      image,
    });
    const populatedPost = await post.populate("author", "username profilePicture");
    res.status(201).json(populatedPost);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts/feed
router.get("/feed", protect, async (req: AuthRequest, res) => {
  try {
    if (!isDbConnected()) {
      const user = demoUsers.find(u => u._id === req.user?.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // In demo mode, return the full list of demo posts (now includes 50+ items)
      const posts = [...demoPosts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return res.json(posts);
    }

    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({
      $or: [
        { author: { $in: user.following } },
        { author: user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePicture" }
      });

    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/like
router.post("/:id/like", protect, async (req: AuthRequest, res) => {
  try {
    if (!isDbConnected()) {
      const post = demoPosts.find(p => p._id === req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      if (post.likes.includes(req.user?.id)) {
        post.likes = post.likes.filter(id => id !== req.user?.id);
      } else {
        post.likes.push(req.user?.id);
      }
      return res.json(post);
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(req.user?.id as any)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user?.id);
    } else {
      post.likes.push(req.user?.id as any);
    }

    await post.save();
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/comment
router.post("/:id/comment", protect, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;

    if (!isDbConnected()) {
      const post = demoPosts.find(p => p._id === req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const user = demoUsers.find(u => u._id === req.user?.id);
      const comment = {
        _id: generateId(),
        post: req.params.id,
        author: {
          _id: user?._id,
          username: user?.username,
          profilePicture: user?.profilePicture
        },
        content,
        createdAt: new Date()
      };
      demoComments.push(comment);
      post.comments.push(comment);
      return res.json(comment);
    }

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user?.id,
      content,
    });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push(comment._id as any);
    await post.save();

    const populatedComment = await comment.populate("author", "username profilePicture");
    res.json(populatedComment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts/user/:username
router.get("/user/:username", async (req, res) => {
  try {
    if (!isDbConnected()) {
      const posts = demoPosts.filter(p => p.author.username.toLowerCase() === req.params.username.toLowerCase())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return res.json(posts);
    }

    const user = await User.findOne({ username: { $regex: new RegExp(`^${req.params.username}$`, "i") } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePicture" }
      });

    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
