import React, { useState } from "react";
import { X, Video, Link as LinkIcon, Hash, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "../api/axios";
import toast from "react-hot-toast";
import ReactPlayer from "react-player";

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReelCreated: (newReel: any) => void;
}

const CreateReelModal: React.FC<CreateReelModalProps> = ({ isOpen, onClose, onReelCreated }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const extractUrl = (input: string) => {
    // Check if it's an iframe string
    if (input.includes("<iframe")) {
      const match = input.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return input;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const extracted = extractUrl(val);
    setVideoUrl(extracted);
    setShowPreview(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = extractUrl(videoUrl);
    if (!finalUrl) return toast.error("Please provide a video URL");

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/reels", {
        videoUrl: finalUrl,
        caption,
        category,
        tags: tags.split(",").map(t => t.trim()).filter(t => t !== "")
      });
      onReelCreated(data);
      toast.success("Reel shared successfully!");
      onClose();
      setVideoUrl("");
      setCaption("");
      setCategory("General");
      setTags("");
      setShowPreview(false);
    } catch (error) {
      toast.error("Failed to share reel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Player = ReactPlayer as any;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <Video size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Create New Reel</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6 hide-scrollbar">
              {showPreview && videoUrl && (
                <div className="aspect-[9/16] w-full max-w-[250px] mx-auto bg-black rounded-2xl overflow-hidden border border-white/10 shadow-xl relative group">
                  <Player
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    playing={true}
                    muted={true}
                    controls={false}
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                      <LinkIcon size={14} /> Video URL or Embed Code
                    </label>
                    {videoUrl && !showPreview && (
                      <button 
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Preview Video
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={handleUrlChange}
                    placeholder="Paste YouTube Shorts link or <iframe> embed code..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <p className="text-[10px] text-white/30 px-1">
                    Supports YouTube Shorts, TikTok-style links, and more. If you paste an embed code, we'll extract the link for you.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60">Caption</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a catchy caption..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                      <Tag size={14} /> Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                      <option value="General">General</option>
                      <option value="Tech">Tech</option>
                      <option value="Travel">Travel</option>
                      <option value="Food">Food</option>
                      <option value="Art">Art</option>
                      <option value="Photography">Photography</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                      <Hash size={14} /> Tags
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="tech, ai, future"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Video size={20} />
                      Share Reel
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateReelModal;
