import React, { useState } from "react";
import { Image, Send, Sparkles } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

interface CreatePostProps {
  onPostCreated: (post: any) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlValue.trim()) {
      setImage(urlValue.trim());
      setUrlValue("");
      setShowUrlInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    try {
      const { data } = await api.post("/posts", { content, image });
      onPostCreated(data);
      setContent("");
      setImage("");
      toast.success("Post shared!");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-3xl p-6 border border-white/10 shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex space-x-4">
          <img
            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
            alt={user?.username}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-black/5 dark:border-white/10 shadow-lg"
          />
          <textarea
            placeholder="Share your thoughts..."
            className="flex-1 p-3 text-gray-900 dark:text-white border-none focus:ring-0 outline-none resize-none min-h-[100px] bg-black/5 dark:bg-white/5 rounded-2xl placeholder:text-gray-400 dark:placeholder:text-white/20 text-lg font-medium"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <AnimatePresence>
          {showUrlInput && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex space-x-2"
            >
              <input
                type="text"
                placeholder="Paste image URL..."
                className="flex-1 px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit(e)}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-4 py-2 bg-black/10 dark:bg-white/10 text-gray-600 dark:text-white/60 rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {image && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative group overflow-hidden rounded-2xl"
            >
              <img src={image} alt="Preview" className="w-full h-64 object-cover" />
              <button
                type="button"
                onClick={() => setImage("")}
                className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md text-white rounded-xl hover:bg-red-500 transition-colors"
              >
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
          <div className="flex space-x-2">
            <input
              type="file"
              id="media-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <motion.label
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              htmlFor="media-upload"
              className="p-3 text-gray-400 dark:text-white/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center space-x-2 cursor-pointer"
              title="Upload image"
            >
              <Image size={22} />
              <span className="text-xs font-bold uppercase tracking-wider">Media</span>
            </motion.label>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className={`p-3 rounded-2xl transition-all flex items-center space-x-2 ${showUrlInput ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'text-gray-400 dark:text-white/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="Add image URL"
            >
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">URL</span>
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center space-x-3 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 font-black uppercase tracking-widest text-xs"
          >
            <span>Post</span>
            <Send size={18} />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreatePost;
