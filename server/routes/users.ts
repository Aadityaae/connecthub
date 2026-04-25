import express from "express";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
import mongoose from "mongoose";
import { demoUsers } from "../lib/demoStore";
import jwt from "jsonwebtoken";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/users/me
router.get("/me", protect, async (req: AuthRequest, res) => {
  try {
    if (!isDbConnected()) {
      const user = demoUsers.find(u => u._id === req.user?.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    }
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/suggested
router.get("/suggested", protect, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.id;

    if (!isDbConnected()) {
      const currentUser = demoUsers.find(u => u._id === currentUserId);
      const suggested = demoUsers.filter(u => 
        u.isSuggested && 
        u._id !== currentUserId && 
        (!currentUser || !currentUser.following.includes(u._id))
      );
      return res.json(suggested);
    }

    const currentUser = await User.findById(currentUserId);
    const followingIds = currentUser?.following || [];

    // Filter out invalid ObjectIds to prevent Mongoose errors
    const ninIds: any[] = followingIds.filter(id => mongoose.Types.ObjectId.isValid(id.toString()));
    if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
      ninIds.push(currentUserId);
    }

    const suggested = await User.find({
      _id: { $nin: ninIds }
    }).limit(5).select("-password");

    res.json(suggested);
  } catch (error: any) {
    console.error("Error in /suggested route:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/profile/:username
router.get("/profile/:username", async (req, res) => {
  try {
    if (!isDbConnected()) {
      let user = demoUsers.find(u => u.username.toLowerCase() === req.params.username.toLowerCase());
      
      // If not found in demoUsers, check if it's the current user from token (Self-Healing)
      if (!user && req.headers.authorization) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
          if (decoded.username && decoded.username.toLowerCase() === req.params.username.toLowerCase()) {
            console.log(`🛠️ Self-healing (Public Route): Re-adding user ${decoded.username} to Demo Mode`);
            user = {
              _id: decoded.id,
              username: decoded.username,
              email: decoded.email,
              password: "password",
              profilePicture: "",
              bio: "",
              followers: [],
              following: [],
              createdAt: new Date()
            };
            demoUsers.push(user);
          }
        } catch (e) {
          // Token invalid or other error, ignore
        }
      }

      if (!user) return res.status(404).json({ message: "User not found" });
      
      // Simulate population for demo mode
      const populatedUser = {
        ...user,
        followers: demoUsers.filter(u => user.followers.includes(u._id))
          .map(u => ({ _id: u._id, username: u.username, profilePicture: u.profilePicture })),
        following: demoUsers.filter(u => user.following.includes(u._id))
          .map(u => ({ _id: u._id, username: u.username, profilePicture: u.profilePicture }))
      };
      
      return res.json(populatedUser);
    }

    const user = await User.findOne({ username: { $regex: new RegExp(`^${req.params.username}$`, "i") } })
      .select("-password")
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
router.put("/profile", protect, async (req: AuthRequest, res) => {
  try {
    if (!isDbConnected()) {
      const user = demoUsers.find(u => u._id === req.user?.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;
      return res.json(user);
    }

    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/follow/:id
router.post("/follow/:id", protect, async (req: AuthRequest, res) => {
  try {
    if (!isDbConnected()) {
      const userToFollow = demoUsers.find(u => u._id === req.params.id);
      const currentUser = demoUsers.find(u => u._id === req.user?.id);

      if (!userToFollow || !currentUser) return res.status(404).json({ message: "User not found" });

      if (currentUser.following.includes(userToFollow._id)) {
        // Unfollow
        currentUser.following = currentUser.following.filter((id: string) => id !== userToFollow._id);
        userToFollow.followers = userToFollow.followers.filter((id: string) => id !== currentUser._id);
      } else {
        // Follow
        currentUser.following.push(userToFollow._id);
        userToFollow.followers.push(currentUser._id);
      }
      return res.json({ message: "Success" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user?.id);

    if (!userToFollow || !currentUser) return res.status(404).json({ message: "User not found" });

    const isFollowing = currentUser.following.some(id => id.toString() === userToFollow._id.toString());

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());
    } else {
      // Follow
      currentUser.following.push(userToFollow._id as any);
      userToFollow.followers.push(currentUser._id as any);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: "Success" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
