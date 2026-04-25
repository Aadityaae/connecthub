import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Camera, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ReelCard from "../components/ReelCard";
import CreateReelModal from "../components/CreateReelModal";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
const PEXELS_API_KEY = "mZKJYBbG7A50RzkaJDUFcyu8k7dsd0AgBkyK66bxfSTp7WJdvV80azwd";

const fetchPexelsVideos = async () => {
  const res = await fetch(
    "https://api.pexels.com/videos/popular?per_page=10",
    {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    }
  );

  const data = await res.json();

  return data.videos.map((v: any) => {
    const file = v.video_files.find((f: any) => f.file_type === "video/mp4");

    return {
      _id: v.id.toString(),
      videoUrl: file?.link,
      caption: v.url || "Random Reel",
      author: {
        username: v.user.name,
        profilePicture: "https://i.pravatar.cc/150?img=" + (v.id % 70)
      },
      likes: []
    };
  });
};

const Reels: React.FC = () => {
  const { user } = useAuth();
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReels();
  }, []);

  const handleOpenCreateModal = () => {
    if (!user) {
      toast.error("Please login to share a reel");
      navigate("/login");
      return;
    }
    setIsCreateModalOpen(true);
  };

  const shuffleArray = (array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const fetchReels = async (isLoadMore = false) => {
    if (fetchingMore) return;

    if (isLoadMore) setFetchingMore(true);
    else setLoading(true);

    try {
      const newVideos = await fetchPexelsVideos();

      setReels(prev => {
        const existingIds = new Set(prev.map(r => r._id));
        const filtered = newVideos.filter((v: any) => !existingIds.has(v._id));
        
        if (isLoadMore) {
          return [...prev, ...filtered];
        } else {
          return shuffleArray([...prev, ...filtered]);
        }
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch reels");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
          }
        });
      },
      { 
        threshold: 0.5,
        rootMargin: "0px"
      }
    );

    const elements = document.querySelectorAll(".reel");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [reels]);

  const handleReelCreated = (newReel: any) => {
    setReels([newReel, ...reels]);
    setActiveIndex(0);
  };

  const validReels = reels.filter(r => r.videoUrl && r.videoUrl.endsWith(".mp4"));

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white font-medium animate-pulse">
            Loading Reels...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden flex justify-center">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/")}
          className="p-2 text-white pointer-events-auto"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </motion.button>
        <h2 className="text-white font-bold text-lg pointer-events-auto">Reels</h2>
        <div className="flex items-center space-x-4 pointer-events-auto">
          <button 
            onClick={handleOpenCreateModal}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <Camera size={28} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <CreateReelModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onReelCreated={handleReelCreated} 
      />

      {/* Reels Container */}
      <div
        ref={containerRef}
        className="reel-container w-full max-w-[450px] h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar bg-zinc-900 shadow-2xl"
      >
        {validReels.length > 0 ? (
          <>
            {validReels.map((reel, index) => {
              // Performance Boost: Only render nearby videos
              if (Math.abs(index - activeIndex) > 2) {
                return (
                  <div 
                    key={reel._id} 
                    data-index={index} 
                    className="reel h-screen w-full snap-start shrink-0 bg-black"
                  />
                );
              }

              return (
                <div 
                  key={reel._id} 
                  data-index={index} 
                  className="reel h-screen w-full snap-start shrink-0"
                >
                  <ReelCard reel={reel} isActive={index === activeIndex} />
                </div>
              );
            })}
            {fetchingMore && (
              <div className="h-20 w-full flex items-center justify-center bg-black">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-white p-10 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <Camera size={40} className="text-white/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Reels Yet</h3>
            <p className="text-white/50 mb-6">Be the first one to share a reel with the community!</p>
            <button 
              onClick={() => fetchReels(true)}
              className="px-6 py-2 bg-indigo-500 text-white rounded-full font-bold hover:bg-indigo-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reels;
