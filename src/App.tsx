import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Reels from "./pages/Reels";
import NewsFeed from "./components/NewsFeed";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

const AnimatedBackground = () => (
  <div className="animated-bg">
    <div className="blob"></div>
    <div className="blob blob-2"></div>
    <div className="blob blob-3"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-900 dark:text-white">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppContent = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  const isReelsPage = location.pathname === "/reels";

  return (
    <div className="min-h-screen relative">
      {!isReelsPage && <AnimatedBackground />}
      {token && !isReelsPage && <Navbar />}
      <main className={`${token && !isReelsPage ? "pt-24 max-w-4xl mx-auto px-4" : ""} relative z-10`}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reels"
              element={
                <ProtectedRoute>
                  <Reels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:userId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news"
              element={
                <ProtectedRoute>
                  <NewsFeed />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)",
            color: theme === "dark" ? "#fff" : "#000",
            backdropFilter: "blur(10px)",
            border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "16px",
          },
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
