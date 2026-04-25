import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Send, ChevronLeft, MessageCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

const Chat = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get("/messages/conversations/list");
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations");
    }
  };

  const fetchMessages = async () => {
    if (!userId) return;
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setMessages(data);
      
      const found = conversations.find(c => c._id === userId);
      if (found) {
        setSelectedUser(found);
      } else {
        const { data: profile } = await api.get(`/users/profile/${userId}`);
        setSelectedUser(profile);
      }
    } catch (error) {
      console.error("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    try {
      const { data } = await api.post("/messages", {
        receiverId: userId,
        content: newMessage,
      });
      setMessages([...messages, data]);
      setNewMessage("");
      fetchConversations();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex h-[calc(100vh-140px)] glass rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden"
    >
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-black/5 dark:border-white/5 flex flex-col ${userId ? "hidden md:flex" : "flex"}`}>
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">Inbox</h2>
          <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest">No chats yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <motion.div
                whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                key={conv._id}
                onClick={() => navigate(`/chat/${conv._id}`)}
                className={`flex items-center space-x-4 p-5 cursor-pointer transition-all ${
                  userId === conv._id ? "bg-black/5 dark:bg-white/10 border-r-4 border-indigo-500" : ""
                }`}
              >
                <img
                  src={conv.profilePicture || `https://ui-avatars.com/api/?name=${conv.username}&background=random`}
                  alt={conv.username}
                  className="w-12 h-12 rounded-2xl object-cover border border-black/5 dark:border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">@{conv.username}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-widest font-black">Online</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!userId ? "hidden md:flex items-center justify-center bg-black/20" : "flex"}`}>
        {!userId ? (
          <div className="text-center space-y-6">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20 shadow-2xl shadow-indigo-500/10"
            >
              <MessageCircle size={40} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Select a Chat</h3>
              <p className="text-gray-500 dark:text-white/30 text-sm mt-2 font-medium">Pick a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5">
              <div className="flex items-center space-x-4">
                <button onClick={() => navigate("/chat")} className="md:hidden text-gray-500 dark:text-white/50 hover:text-indigo-600 dark:hover:text-white">
                  <ChevronLeft size={24} />
                </button>
                {selectedUser && (
                  <>
                    <img
                      src={selectedUser.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=random`}
                      alt={selectedUser.username}
                      className="w-10 h-10 rounded-xl object-cover border border-black/5 dark:border-white/10"
                    />
                    <div>
                      <Link to={`/profile/${selectedUser.username}`} className="font-black text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        @{selectedUser.username}
                      </Link>
                      <p className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-widest">Active Now</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/10 custom-scrollbar">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.sender === currentUser?._id ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg._id}
                    className={`flex ${msg.sender === currentUser?._id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-3xl shadow-2xl ${
                        msg.sender === currentUser?._id
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20"
                          : "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white rounded-tl-none border border-black/5 dark:border-white/5 backdrop-blur-md"
                      }`}
                    >
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      <div className={`text-[9px] font-black uppercase tracking-widest mt-2 opacity-40 ${msg.sender === currentUser?._id ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-6 py-4 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 font-medium"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  <Send size={22} />
                </motion.button>
              </form>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Chat;
