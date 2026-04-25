import fetch from "node-fetch";
import express from "express";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import Reel from "../models/Reel";
import mongoose from "mongoose";
import { demoReels, demoUsers } from "../lib/demoStore";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/reels
// @desc    Get reels with simple recommendation logic
router.get("/", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!isDbConnected()) {
      const page = Math.floor(Math.random() * 50) + 1; // random page

      const endpoints = [
        "popular",
        "search?query=people",
        "search?query=travel",
        "search?query=fitness",
        "search?query=technology"
      ];

      const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const url = `https://api.pexels.com/videos/${randomEndpoint}${randomEndpoint.includes("?") ? "&" : "?"}per_page=10&page=${page}`;

      const response = await fetch(
        url,
        {
          headers: {
            Authorization: process.env.PEXELS_API_KEY!
          }
        }
      );

      const data: any = await response.json();

      const reels = data.videos.map((v: any) => {
    const file = v.video_files.find((f: any) => f.file_type === "video/mp4");

    return {
      _id: v.id + "_" + Math.random(),
      videoUrl: file?.link,
      caption: v.url || "Random Reel",
      author: {
        _id: "pexels",
        username: v.user.name,
        profilePicture: "https://i.pravatar.cc/150?img=" + (v.id % 70)
      },
      likes: [],
      createdAt: new Date()
    };
  });

  return res.json(reels);
}

    // DB Mode - Randomize if no specific preference logic is requested
    let reels = await Reel.find().populate("author", "username profilePicture");
    reels.sort(() => Math.random() - 0.5);
    res.json(reels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reels
router.post("/", protect, async (req: AuthRequest, res) => {
  try {
    const { videoUrl, caption, category, tags } = req.body;
    const userId = req.user?.id;

    if (!isDbConnected()) {
      const currentUser = demoUsers.find(u => u._id === userId);
      const newReel = {
        _id: `reel_${Date.now()}`,
        author: {
          _id: currentUser?._id || userId,
          username: currentUser?.username || "demo_user",
          profilePicture: currentUser?.profilePicture || ""
        },
        videoUrl,
        caption,
        category: category || "General",
        tags: tags || [],
        likes: [],
        createdAt: new Date()
      };
      demoReels.unshift(newReel);
      return res.status(201).json(newReel);
    }

    const newReel = new Reel({
      author: userId,
      videoUrl,
      caption,
      category: category || "General",
      tags: tags || []
    });

    await newReel.save();
    const populatedReel = await newReel.populate("author", "username profilePicture");
    res.status(201).json(populatedReel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/reels/:id/like
router.post("/:id/like", protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!isDbConnected()) {
      const reel = demoReels.find(r => r._id === req.params.id);
      if (!reel) return res.status(404).json({ message: "Reel not found" });

      if (reel.likes.includes(userId)) {
        reel.likes = reel.likes.filter((id: string) => id !== userId);
      } else {
        reel.likes.push(userId);
      }
      return res.json(reel);
    }

    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });

    const isLiked = reel.likes.includes(userId as any);
    if (isLiked) {
      reel.likes = reel.likes.filter(id => id.toString() !== userId);
    } else {
      reel.likes.push(userId as any);
    }

    await reel.save();
    const populatedReel = await reel.populate("author", "username profilePicture");
    res.json(populatedReel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
