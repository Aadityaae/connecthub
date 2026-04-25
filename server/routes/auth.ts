import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import mongoose from "mongoose";
import { demoUsers, generateId } from "../lib/demoStore";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(`Registration attempt: ${username} (${email})`);

  try {
    if (!isDbConnected()) {
      console.log("⚠️ DB not connected, using Demo Mode for registration");
      const userExists = demoUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() || 
        u.username.toLowerCase() === username.toLowerCase()
      );
      if (userExists) return res.status(400).json({ message: "User already exists (Demo Mode)" });

      const newUser = {
        _id: generateId(),
        username,
        email,
        password, // In real app, this would be hashed, but for demo we skip for simplicity
        profilePicture: "",
        bio: "",
        followers: [],
        following: [],
        createdAt: new Date()
      };
      demoUsers.push(newUser);

      const token = jwt.sign(
        { id: newUser._id, username: newUser.username, email: newUser.email }, 
        process.env.JWT_SECRET || "secret", 
        { expiresIn: "30d" }
      );
      return res.status(201).json({ ...newUser, token });
    }

    const userExists = await User.findOne({ 
      $or: [
        { email: { $regex: new RegExp(`^${email}$`, "i") } }, 
        { username: { $regex: new RegExp(`^${username}$`, "i") } }
      ] 
    });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt: ${email}`);

  try {
    if (!isDbConnected()) {
      console.log("⚠️ DB not connected, using Demo Mode for login");
      const user = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
        const token = jwt.sign(
          { id: user._id, username: user.username, email: user.email }, 
          process.env.JWT_SECRET || "secret", 
          { expiresIn: "30d" }
        );
        return res.json({ ...user, token });
      }
      return res.status(401).json({ message: "Invalid email or password (Demo Mode)" });
    }

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });
    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
