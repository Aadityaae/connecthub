import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { UserPlus, ShieldCheck } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return toast.error("Username can only contain letters, numbers, and underscores");
    }

    try {
      const { data } = await api.post("/auth/register", { username, email, password });
      login(data);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 glass rounded-[2.5rem] shadow-2xl border border-white/10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <UserPlus className="text-white" size={32} />
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-2 tracking-tighter">Join Hub</h2>
        <p className="text-center text-gray-500 dark:text-white/40 mb-10 text-sm font-medium uppercase tracking-widest">
          Create your new account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 dark:text-white/40 uppercase tracking-widest ml-1">Username</label>
            <input
              type="text"
              required
              placeholder="johndoe"
              className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/10 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 dark:text-white/40 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/10 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 dark:text-white/40 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/10 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all font-black uppercase tracking-widest text-sm"
          >
            Create Account
          </motion.button>
        </form>

        <div className="mt-10 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col items-center space-y-4">
          <p className="text-gray-500 dark:text-white/40 text-sm font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:text-purple-500 dark:hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
          
          <div className="flex items-center space-x-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-tighter">
              Demo Mode Enabled
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
