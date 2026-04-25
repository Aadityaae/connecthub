import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { UserPlus, UserMinus, MessageCircle, Calendar, Grid, Heart, MessageSquare, Sparkles } from "lucide-react";
import PostCard from "../components/PostCard";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editPic, setEditPic] = useState("");

  const fetchData = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/profile/${username}`),
        api.get(`/posts/user/${username}`)
      ]);
      setProfile(profileRes.data);
      setPosts(postsRes.data);
      setEditBio(profileRes.data.bio || "");
      setEditPic(profileRes.data.profilePicture || "");
    } catch (error) {
      toast.error("User not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  const handleFollow = async () => {
    try {
      await api.post(`/users/follow/${profile._id}`);
      fetchData();
      toast.success(isFollowing ? "Unfollowed" : "Following");
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handlePicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/users/profile", { bio: editBio, profilePicture: editPic });
      toast.success("Profile updated!");
      setIsEditing(false);
      fetchData();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  if (loading) return (
    <div className="py-20 text-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
      />
      <p className="text-gray-500 dark:text-white/40 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
    </div>
  );
  if (!profile) return <div className="py-20 text-center text-gray-500 dark:text-white/40 font-bold uppercase tracking-widest">User not found</div>;

  const isFollowing = profile.followers.some((f: any) => f._id === currentUser?._id);
  const isOwnProfile = currentUser?.username?.toLowerCase() === username?.toLowerCase();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-6 space-y-8"
    >
      <div className="glass rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 relative">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
          <div className="absolute bottom-6 right-6">
            <Sparkles className="text-white/20 w-24 h-24" />
          </div>
        </div>
        <div className="px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-20 mb-8">
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.username}&background=random`}
              alt={profile.username}
              className="w-40 h-40 rounded-[2.5rem] border-8 border-slate-100 dark:border-black object-cover bg-white shadow-2xl"
            />
            <div className="flex space-x-3 mb-2">
              {!isOwnProfile && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFollow}
                    className={`flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${
                      isFollowing 
                        ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/20" 
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus size={18} />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>Follow</span>
                      </>
                    )}
                  </motion.button>
                  <Link
                    to={`/chat/${profile._id}`}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-8 py-3.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs shadow-lg"
                    >
                      <MessageCircle size={18} />
                      <span>Message</span>
                    </motion.button>
                  </Link>
                </>
              )}
              {isOwnProfile && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs shadow-lg"
                >
                  Edit Profile
                </motion.button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">@{profile.username}</h1>
              <p className="text-xl text-gray-600 dark:text-white/60 mt-2 font-medium leading-relaxed max-w-2xl">{profile.bio || "No bio yet."}</p>
            </div>
            
            <div className="flex flex-wrap gap-6 text-xs text-gray-500 dark:text-white/40 pt-2 font-black uppercase tracking-widest">
              <div className="flex items-center space-x-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5">
                <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-white/60">Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-12 pt-10 border-t border-black/5 dark:border-white/5 mt-10">
              <div className="flex flex-col">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{posts.length}</span>
                <span className="text-[10px] text-gray-400 dark:text-white/30 uppercase tracking-widest font-black mt-1">Posts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{profile.followers.length}</span>
                <span className="text-[10px] text-gray-400 dark:text-white/30 uppercase tracking-widest font-black mt-1">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{profile.following.length}</span>
                <span className="text-[10px] text-gray-400 dark:text-white/30 uppercase tracking-widest font-black mt-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center space-x-3 text-gray-400 dark:text-white/20 border-b border-black/5 dark:border-white/5 pb-6">
          <Grid size={20} />
          <span className="text-xs font-black uppercase tracking-[0.3em]">User Feed</span>
        </div>

        {posts.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-24 glass rounded-[2.5rem]"
          >
            <p className="text-gray-500 dark:text-white/20 font-black uppercase tracking-widest text-sm">No posts yet.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass w-full max-w-lg rounded-[2.5rem] p-10 border border-white/10 shadow-2xl"
            >
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter">Edit Profile</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 dark:text-white/40 uppercase tracking-widest ml-1">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={editPic || `https://ui-avatars.com/api/?name=${profile.username}&background=random`} 
                      className="w-16 h-16 rounded-2xl object-cover border border-black/10 dark:border-white/10"
                      alt="Preview"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        id="profile-pic-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePicFileChange}
                      />
                      <label 
                        htmlFor="profile-pic-upload"
                        className="block w-full text-center py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white"
                      >
                        Upload Photo
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste image URL..."
                        className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                        value={editPic}
                        onChange={(e) => setEditPic(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 dark:text-white/40 uppercase tracking-widest ml-1">Bio</label>
                  <textarea
                    className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/10 transition-all min-h-[120px] resize-none"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
