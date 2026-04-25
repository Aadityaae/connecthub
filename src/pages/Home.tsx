import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import SuggestedUsers from "../components/SuggestedUsers";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const StoryViewer = ({ story, onClose }: { story: any, onClose: () => void }) => {
// ... existing StoryViewer component ...
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white z-10"
      >
        <X size={32} />
      </button>

      <div className="relative w-full max-w-md h-[80vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center gap-3">
          <img src={story.userImage} className="w-8 h-8 rounded-full border border-white/20" alt="" referrerPolicy="no-referrer" />
          <span className="text-white font-bold text-sm">{story.username}</span>
          <span className="text-white/40 text-xs">2h</span>
        </div>

        <img src={story.image} className="w-full h-full object-cover" alt="Story" referrerPolicy="no-referrer" />

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Send message..." 
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm outline-none focus:bg-white/20 transition-all"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<any>(null);

  const stories = [
    { id: 1, username: "leomessi", userImage: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=200&auto=format&fit=crop", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop" },
    { id: 2, username: "cristiano", userImage: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=200&auto=format&fit=crop", image: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=800&auto=format&fit=crop" },
    { id: 3, username: "selenagomez", userImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop" },
    { id: 4, username: "therock", userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" },
    { id: 5, username: "tech_guru", userImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop" },
  ];

  const fetchFeed = async () => {
    try {
      const { data } = await api.get("/posts/feed");
      setPosts(data);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        toast.error("Failed to load feed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) return (
    <div className="py-20 text-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
      />
      <p className="text-gray-500 dark:text-white/40 font-bold uppercase tracking-widest text-xs">Loading Feed...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6"
    >
      <AnimatePresence>
        {activeStory && (
          <StoryViewer story={activeStory} onClose={() => setActiveStory(null)} />
        )}
      </AnimatePresence>

      <div className="lg:col-span-2 space-y-8">
        {/* Stories Bar */}
        <div className="flex space-x-5 overflow-x-auto pb-6 hide-scrollbar">
          {/* Your Story */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer"
          >
            <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-fuchsia-600">
              <div className="w-full h-full rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden relative">
                <img src={user?.profilePicture || "https://picsum.photos/seed/me/200/200"} alt="Your story" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Plus size={16} className="text-white" />
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-tighter">Your Story</span>
          </motion.div>
          
          {stories.map((story) => (
            <motion.div 
              key={story.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveStory(story)}
              className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                <div className="w-full h-full rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden">
                  <img src={story.userImage} alt={story.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-tighter">{story.username}</span>
            </motion.div>
          ))}
        </div>

        <CreatePost onPostCreated={handlePostCreated} />
        {posts.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-20 glass rounded-3xl"
          >
            <p className="text-gray-500 dark:text-white/40 font-medium">No posts yet. Follow some users to see their posts!</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
      
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <SuggestedUsers />
        </div>
      </div>
    </motion.div>
  );
};

export default Home;

