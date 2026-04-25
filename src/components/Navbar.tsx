import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, MessageCircle, User, LogOut, Search, Sun, Moon, Clapperboard, Newspaper } from "lucide-react";
import api from "../api/axios";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/messages/unread-count");
      setUnreadCount(data.count);
    } catch (error) {
      // Silently fail to avoid console clutter when DB is disconnected
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl glass rounded-2xl z-50 h-16"
    >
      <div className="h-full px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">
            Connect<span className="text-indigo-400">Hub</span>
          </span>
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Link
            to="/"
            className="p-2.5 text-gray-600 dark:text-white/70 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
            title="Home"
          >
            <Home size={22} />
          </Link>
          <Link
            to="/reels"
            className="p-2.5 text-gray-600 dark:text-white/70 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
            title="Reels"
          >
            <Clapperboard size={22} />
          </Link>
          <Link
            to="/news"
            className="p-2.5 text-gray-600 dark:text-white/70 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
            title="News"
          >
            <Newspaper size={22} />
          </Link>
          <Link
            to="/chat"
            className="p-2.5 text-gray-600 dark:text-white/70 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all relative"
            title="Messages"
          >
            <MessageCircle size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white/20">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <Link
            to={`/profile/${user?.username}`}
            className="p-2.5 text-gray-600 dark:text-white/70 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
            title="Profile"
          >
            <User size={22} />
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2.5 text-gray-600 dark:text-white/70 hover:text-indigo-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-all"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
          </button>
          <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-2"></div>
          <button
            onClick={handleLogout}
            className="p-2.5 text-gray-400 dark:text-white/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
