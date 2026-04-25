import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

interface PostCardProps {
  post: any;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showHeart, setShowHeart] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isLiked = likes.includes(user?._id);

  const formatEngagement = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  };

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLikes(data.likes);
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { content: commentText });
      setComments([...comments, data]);
      setCommentText("");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card overflow-hidden group/card"
    >
      <div className="p-4 flex items-center justify-between">
        <Link to={`/profile/${post.author.username}`} className="flex items-center space-x-3 group">
          <div className="relative">
            <img
              src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
              alt={post.author.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/20 group-hover:border-indigo-500 transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-400 transition-colors">
              {post.author.username}
            </p>
            <p className="text-[10pt] text-gray-500 dark:text-white/40 font-medium">
              {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </Link>
        <button className="text-gray-400 dark:text-white/30 hover:text-indigo-600 dark:hover:text-white transition-colors p-2 hover:bg-indigo-500/10 rounded-full">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="px-4 pb-3">
        <p className={`text-gray-800 dark:text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap ${!isExpanded && post.content.length > 150 ? "line-clamp-3" : ""}`}>
          {post.content}
        </p>
        {post.content.length > 150 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-indigo-500 text-xs font-bold mt-1 hover:underline"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {post.image && (
        <div className="relative aspect-square sm:aspect-video overflow-hidden cursor-pointer" onDoubleClick={handleDoubleTap}>
          <motion.img 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5 }}
            src={post.image} 
            alt="Post content" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart size={100} fill="white" color="white" className="drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className={`flex items-center space-x-2 group/btn transition-all ${isLiked ? "text-pink-500" : "text-gray-500 dark:text-white/50 hover:text-pink-500"}`}
          >
            <div className={`p-2 rounded-full transition-colors ${isLiked ? "bg-pink-500/10" : "group-hover/btn:bg-pink-500/10"}`}>
              <Heart size={22} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold">{formatEngagement(likes.length)}</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center space-x-2 group/btn transition-all ${showComments ? "text-indigo-500" : "text-gray-500 dark:text-white/50 hover:text-indigo-500"}`}
          >
            <div className={`p-2 rounded-full transition-colors ${showComments ? "bg-indigo-500/10" : "group-hover/btn:bg-indigo-500/10"}`}>
              <MessageSquare size={22} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold">{formatEngagement(comments.length)}</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.8 }}
            className="flex items-center space-x-2 group/btn text-gray-500 dark:text-white/50 hover:text-emerald-500 transition-all"
          >
            <div className="p-2 rounded-full group-hover/btn:bg-emerald-500/10">
              <Share2 size={22} strokeWidth={2.5} />
            </div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 space-y-5 bg-black/5 dark:bg-black/20 border-t border-black/5 dark:border-white/5 pt-5"
          >
            <form onSubmit={handleComment} className="flex space-x-3">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 px-5 py-3 text-sm border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!commentText.trim()}
                className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
              >
                Post
              </motion.button>
            </form>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment: any) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={comment._id} 
                  className="flex space-x-3"
                >
                  <img
                    src={comment.author.profilePicture || `https://ui-avatars.com/api/?name=${comment.author.username}&background=random`}
                    alt={comment.author.username}
                    className="w-9 h-9 rounded-xl object-cover border border-black/5 dark:border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 bg-black/5 dark:bg-white/5 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">@{comment.author.username}</p>
                    <p className="text-sm text-slate-700 dark:text-white/80 mt-1">{comment.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;
