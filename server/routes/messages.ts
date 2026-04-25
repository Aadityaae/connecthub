import express from "express";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import Message from "../models/Message";
import User from "../models/User";
import mongoose from "mongoose";
import { demoMessages, demoUsers, generateId } from "../lib/demoStore";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/messages/unread-count
router.get("/unread-count", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    if (!isDbConnected()) {
      try {
        const count = demoMessages.filter(msg => 
          msg.receiver === userId && !msg.read
        ).length;
        return res.json({ count });
      } catch (demoError) {
        return res.json({ count: 0 });
      }
    }

    const count = await Message.countDocuments({
      receiver: userId,
      read: false
    });
    res.json({ count });
  } catch (error: any) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/conversations/list
router.get("/conversations/list", protect, async (req: AuthRequest, res) => {
  try {
    if (!isDbConnected()) {
      const messages = demoMessages.filter(msg => 
        msg.sender === req.user?.id || msg.receiver === req.user?.id
      ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const userIds = new Set<string>();
      messages.forEach(msg => {
        if (msg.sender !== req.user?.id) userIds.add(msg.sender);
        if (msg.receiver !== req.user?.id) userIds.add(msg.receiver);
      });

      const users = demoUsers.filter(u => userIds.has(u._id))
        .map(u => ({ _id: u._id, username: u.username, profilePicture: u.profilePicture }));

      return res.json(users);
    }

    // Get all users I've messaged or who messaged me
    const messages = await Message.find({
      $or: [{ sender: req.user?.id }, { receiver: req.user?.id }]
    }).sort({ createdAt: -1 });

    const userIds = new Set<string>();
    messages.forEach(msg => {
      if (msg.sender.toString() !== req.user?.id) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== req.user?.id) userIds.add(msg.receiver.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } })
      .select("username profilePicture");

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/messages
router.post("/", protect, async (req: AuthRequest, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!isDbConnected()) {
      const message = {
        _id: generateId(),
        sender: req.user?.id,
        receiver: receiverId,
        content,
        read: false,
        createdAt: new Date()
      };
      demoMessages.push(message);
      return res.status(201).json(message);
    }

    const message = await Message.create({
      sender: req.user?.id,
      receiver: receiverId,
      content,
    });
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/:userId
router.get("/:userId", protect, async (req: AuthRequest, res) => {
  try {
    if (!isDbConnected()) {
      const messages = demoMessages.filter(msg => 
        (msg.sender === req.user?.id && msg.receiver === req.params.userId) ||
        (msg.sender === req.params.userId && msg.receiver === req.user?.id)
      ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // Mark as read
      demoMessages.forEach(msg => {
        if (msg.sender === req.params.userId && msg.receiver === req.user?.id && !msg.read) {
          msg.read = true;
        }
      });

      return res.json(messages);
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user?.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user?.id }
      ]
    }).sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user?.id, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
