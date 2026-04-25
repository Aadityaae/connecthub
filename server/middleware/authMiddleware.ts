import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { demoUsers } from "../lib/demoStore";
import mongoose from "mongoose";

const isDbConnected = () => mongoose.connection.readyState === 1;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username?: string;
    email?: string;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string, username?: string, email?: string };
    req.user = { 
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };

    // Self-healing for Demo Mode: if user is in token but not in demoUsers, re-add them
    if (!isDbConnected() && decoded.username && decoded.email) {
      const userExists = demoUsers.find(u => u._id === decoded.id);
      if (!userExists) {
        console.log(`🛠️ Self-healing: Re-adding user ${decoded.username} to Demo Mode`);
        demoUsers.push({
          _id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          password: "password", // Dummy password
          profilePicture: "",
          bio: "",
          followers: [],
          following: [],
          createdAt: new Date()
        });
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
