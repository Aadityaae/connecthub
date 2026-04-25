import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { UserPlus, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "motion/react";

const SuggestedUsers = () => {
  const { user: currentUser } = useAuth();
  const [suggested, setSuggested] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggested = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const { data } = await api.get("/users/suggested");
        setSuggested(data);
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error("Failed to fetch suggested users:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSuggested();
  }, [currentUser]);

  const [followingIds, setFollowingIds] = useState<string[]>([]);

  const handleFollow = async (userId: string, username: string) => {
    if (followingIds.includes(userId)) return;
    
    setFollowingIds(prev => [...prev, userId]);
    try {
      await api.post(`/users/follow/${userId}`);
      toast.success(`Followed @${username}`);
      setSuggested(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setFollowingIds(prev => prev.filter(id => id !== userId));
    }
  };

  if (loading) return null;
  if (suggested.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-3xl p-6 border border-white/10 shadow-2xl"
    >
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest">Suggested for you</h3>
      </div>
      
      <div className="space-y-5">
        {suggested.map((user, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={user._id} 
            className="flex items-center justify-between group"
          >
            <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                alt={user.username}
                className="w-10 h-10 rounded-xl object-cover border border-black/5 dark:border-white/10 group-hover:border-indigo-400 transition-all"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">@{user.username}</p>
                <p className="text-[10px] text-slate-500 dark:text-white/40 truncate uppercase font-bold tracking-tighter">{user.genre || "Suggested"}</p>
              </div>
            </Link>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={followingIds.includes(user._id)}
              className={`p-2 rounded-xl transition-all ${
                followingIds.includes(user._id) 
                  ? "text-gray-400 bg-gray-100 dark:bg-white/5 cursor-not-allowed" 
                  : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
              }`}
              onClick={() => handleFollow(user._id, user.username)}
            >
              {followingIds.includes(user._id) ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"
                />
              ) : (
                <UserPlus size={18} />
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 text-[10px] text-gray-400 dark:text-white/20 uppercase tracking-widest font-black text-center">
        ConnectHub &copy; 2026
      </div>
    </motion.div>
  );
};

export default SuggestedUsers;
