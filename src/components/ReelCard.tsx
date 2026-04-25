import React, { useState, useRef, useEffect, useMemo, memo } from "react";
import { Heart, MessageCircle, Share2, UserPlus, Music2, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ReactPlayer from "react-player";

interface ReelCardProps {
  reel: any;
  isActive: boolean;
}

const ReelCard: React.FC<ReelCardProps> = memo(({ reel, isActive }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(reel.likes);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isLiked = likes.includes(user?._id);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    if (isActive) {
      // Small delay to ensure DOM is stable and avoid "interrupted by removal" errors
      const playTimeout = setTimeout(() => {
        if (!isMounted || !video) return;
        
        video.currentTime = 0;
        setHasError(false);
        
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // Ignore interruption errors as they are common during fast scrolling
            if (err.name !== "AbortError") {
              console.error("Playback failed:", err);
              // Only set error if it's a real loading issue, not a user interaction/navigation issue
              if (err.name === "NotSupportedError" || err.name === "NetworkError") {
                setHasError(true);
              }
            }
          });
        }
      }, 50);

      return () => {
        isMounted = false;
        clearTimeout(playTimeout);
      };
    } else {
      video.pause();
    }
  }, [isActive]);

  // Performance Boost: Preload next video
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.preload = isActive ? "auto" : "metadata";
  }, [isActive]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data } = await api.post(`/reels/${reel._id}/like`);
      setLikes(data.likes);
    } catch (error) {
      toast.error("Failed to like reel");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center snap-start overflow-hidden">
      <div className="w-full h-full relative" onClick={toggleMute}>
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-zinc-900">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-zinc-900 text-white p-6 text-center">
            <Music2 size={48} className="text-white/20 mb-4" />
            <p className="text-sm font-medium text-white/60 mb-4">Video unavailable</p>
            <button 
              onClick={() => { setHasError(false); setIsLoading(true); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          src={reel.videoUrl}
          muted={isMuted}
          loop
          playsInline
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Play/Unmute Overlay */}
        {isActive && isMuted && !isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex items-center gap-3"
              >
                <Music2 size={20} className="text-white animate-pulse" />
                <span className="text-white text-sm font-bold">Tap to Unmute</span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Right Side Actions (Instagram Style) */}
      <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-6 z-10">
        <div className="flex flex-col items-center space-y-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className="text-white drop-shadow-lg"
          >
            <Heart size={28} fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "white"} strokeWidth={2.5} />
          </motion.button>
          <span className="text-white text-xs font-semibold drop-shadow-md">{likes.length}</span>
        </div>

        <div className="flex flex-col items-center space-y-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            className="text-white drop-shadow-lg"
          >
            <MessageCircle size={28} strokeWidth={2.5} />
          </motion.button>
          <span className="text-white text-xs font-semibold drop-shadow-md">24</span>
        </div>

        <div className="flex flex-col items-center space-y-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            className="text-white drop-shadow-lg"
          >
            <Share2 size={28} strokeWidth={2.5} />
          </motion.button>
        </div>

        <button className="text-white drop-shadow-lg">
          <MoreVertical size={24} strokeWidth={2.5} />
        </button>

        <div className="w-8 h-8 rounded-md border-2 border-white overflow-hidden animate-spin-slow">
          <img src={reel.author.profilePicture} className="w-full h-full object-cover" alt="audio" />
        </div>
      </div>

      {/* Bottom Info (Instagram Style) */}
      <div className="absolute bottom-6 left-4 right-16 z-10 pointer-events-none">
        <div className="flex items-center space-x-3 mb-3 pointer-events-auto">
          <img
            src={reel.author.profilePicture || `https://ui-avatars.com/api/?name=${reel.author.username}&background=random`}
            alt={reel.author.username}
            className="w-8 h-8 rounded-full border border-white/20 object-cover"
          />
          <span className="text-white font-bold text-sm">
            {reel.author.username}
          </span>
          <button className="px-3 py-1 rounded-lg border border-white/40 text-white text-xs font-bold hover:bg-white/10 transition-colors">
            Follow
          </button>
        </div>
        
        <p className="text-white text-sm mb-4 line-clamp-2 drop-shadow-md">
          {reel.caption}
        </p>

        <div className="flex items-center space-x-2 text-white bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
          <Music2 size={14} className="animate-spin-slow" />
          <span className="text-xs font-medium truncate max-w-[150px]">
            {reel.author.username} • Original Audio
          </span>
        </div>
      </div>
    </div>
  );
});

export default ReelCard;
