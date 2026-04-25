import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { createServer as createViteServer } from "vite";
import authRoutes from "./server/routes/auth";
import userRoutes from "./server/routes/users";
import postRoutes from "./server/routes/posts";
import messageRoutes from "./server/routes/messages";
import reelRoutes from "./server/routes/reels";
import newsRoutes from "./server/routes/news";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Request Logger
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Database Connection
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("⚠️ MONGO_URI is not defined in environment variables. Database features will not work.");
  } else {
    mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000, // Fail fast (5s) to switch to demo mode
      })
      .then(() => console.log("✅ MongoDB Connected"))
      .catch((err) => {
        if (err.name === 'MongooseServerSelectionError') {
          console.warn("⚠️ MongoDB Connection Warning: Could not connect to Atlas. Check your IP whitelist or MONGO_URI.");
          console.log("ℹ️ Falling back to Demo Mode (In-memory storage).");
        } else {
          console.error("❌ MongoDB Connection Error:", err);
        }
      });
  }

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/reels", reelRoutes);
  app.use("/api/news", newsRoutes);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false // Disable HMR to prevent WebSocket errors in this environment
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
