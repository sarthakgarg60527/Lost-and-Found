import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";
import { 
  Send, ArrowLeft, Image as ImageIcon, Phone, 
  Video, X, MoreVertical, CheckCheck, Mail, ShieldCheck, 
  BellOff, Bell, Ban, Info, Paperclip, Smile, MapPin, Navigation, User, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from 'emoji-picker-react'; 
import axios from "axios";
import SafeZonePicker from "../components/SafeZonePicker"; 

export default function Chat() {
  const { itemId, receiverId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverData, setReceiverData] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState("offline");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSafePicker, setShowSafePicker] = useState(false); 
  const [isMuted, setIsMuted] = useState(false);

  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id || user.id;
  const token = localStorage.getItem("token");

  const roomId = useMemo(() => {
    if (!userId || !receiverId || !itemId) return null;
    return [String(userId), String(receiverId)].sort().join("_") + `_${itemId}`;
  }, [userId, receiverId, itemId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userId || !roomId) return;
    socketRef.current = socket;
    const s = socketRef.current;

    s.on("connect", () => {
        s.emit("user_online", userId);
        s.emit("join_chat", roomId);
        s.emit("get_user_status", receiverId);
    });

    s.on("load_messages", (history) => setMessages(history));
    s.on("receive_message", (data) => {
        setMessages((prev) => [...prev, data]);
        if(!isMuted && data.senderId !== userId) {
            new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(() => {});
        }
    });

    s.on("status_update", (data) => {
      if (String(data.userId) === String(receiverId)) setOnlineStatus(data.status);
    });

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) setReceiverData(res.data);
      } catch (err) { console.error("Fetch Error:", err); }
    };
    fetchUserData();

    return () => {
  s.off("load_messages");
  s.off("receive_message");
  s.off("status_update");
};
  }, [roomId, receiverId, userId, token, isMuted]);

const handleSendMessage = (customPayload = null) => {
  if (!message.trim() && !previewImage && !customPayload) return;

  const payload = customPayload || { 
    text: message, 
    image: previewImage, 
    senderId: userId,        // ✅ correct
    receiverId: receiverId,  // ✅ correct
    itemId: itemId,          // ✅ correct
    type: "text" 
  };

  socketRef.current.emit("send_message", payload);

  setMessage(""); 
  setPreviewImage(null);
  setShowEmojiPicker(false);
};

  const handleSafeZoneSelect = (zone) => {
   const safeZoneMsg = {
  text: `📍 Meeting Point: ${zone.name}`,
  senderId: userId,
  receiverId,
  itemId,
  type: "safe_zone", 
  locationData: { name: zone.name, lat: zone.lat, lon: zone.lon }
};
    handleSendMessage(safeZoneMsg);
    setShowSafePicker(false);
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden text-slate-900 relative">
      
      {/* 🚀 HEADER - Glassmorphism UI */}
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 flex items-center justify-between z-[60] sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all active:scale-90">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsProfileOpen(true)}>
            <div className="relative">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg overflow-hidden border-2 border-white ring-4 ring-slate-50 group-hover:ring-blue-100 transition-all">
                {receiverData?.profileImage ? <img src={receiverData.profileImage} className="w-full h-full object-cover" /> : <User size={20} />}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${onlineStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
                {receiverData?.name || "Loading..."}
                {receiverData?.isVerified && <ShieldCheck size={14} className="text-blue-500 fill-blue-50" />}
              </h1>
              <p className={`text-[10px] font-black uppercase tracking-widest ${onlineStatus === 'online' ? 'text-emerald-500' : 'text-slate-400'}`}>
                {onlineStatus === "online" ? "Active Now" : "Terminal Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-3 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"><Phone size={18} /></button>
          <button className="p-3 rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"><Video size={18} /></button>
          <button onClick={() => setIsProfileOpen(true)} className="p-3 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><MoreVertical size={18} /></button>
        </div>
      </header>

      {/* 📦 CHAT AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar bg-[#F8FAFC] relative">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex flex-col items-center mb-10">
              <div className="px-4 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm">
                  Encryption End-to-End Active
              </div>
          </div>

          {messages.map((msg, i) => {
            const isMe = String(msg.senderId?._id || msg.senderId) === String(userId);
            
            // 📍 SAFE ZONE CARD
            if (msg.type === "safe_zone" || msg.text?.includes("📍 Meeting Point")) {
                const locName = msg.locationData?.name || msg.text?.split(": ")[1] || "Secure Safe Zone";
                return (
                    <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-[320px] w-full bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
                            <div className="h-32 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i2365!3i1581!2m3!1e0!2sm!3i420120488!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0!23i4111425')] bg-center scale-150" />
                                <div className="relative w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40 animate-bounce">
                                    <MapPin size={24} />
                                </div>
                                <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600/20 backdrop-blur-md rounded-full border border-blue-500/30">
                                   <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Meeting Protocol</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="text-base font-black text-slate-800 leading-tight mb-1 truncate uppercase tracking-tighter">{locName}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Verified Safe Meeting Zone</p>
                                <button 
                                    onClick={() => window.open(`https://www.google.com/maps?q=${msg.locationData?.lat || 0},${msg.locationData?.lon || 0}`, '_blank')}
                                    className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                                >
                                    <Navigation size={14} fill="white" /> Launch Navigation
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
            }

            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-3`}>
                {!isMe && (
                   <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0 overflow-hidden border border-white shadow-sm">
                      <img src={receiverData?.profileImage || "/default-avatar.png"} className="w-full h-full object-cover" />
                   </div>
                )}
                <div className={`max-w-[80%] px-5 py-3.5 rounded-[1.8rem] shadow-sm relative ${isMe ? "bg-slate-900 text-white rounded-br-none" : "bg-white text-slate-800 rounded-bl-none border border-slate-100"}`}>
                  {msg.image && (
                     <div className="mb-3 rounded-2xl overflow-hidden shadow-md border-2 border-white/10">
                        <img src={msg.image} className="w-full max-h-80 object-cover" alt="attachment" />
                     </div>
                  )}
                  <p className="leading-relaxed font-bold text-sm md:text-base pr-4">{msg.text}</p>
                  <div className={`flex items-center gap-1.5 mt-2 justify-end text-[8px] font-black uppercase tracking-widest ${isMe ? "text-slate-500" : "text-slate-400"}`}>
                      <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck size={12} className="text-blue-500" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div ref={scrollRef} />
      </main>

      {/* 🖼️ IMAGE PREVIEW (BEFORE SEND) */}
      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-28 left-6 z-50">
             <div className="relative group">
                <img src={previewImage} className="w-24 h-24 object-cover rounded-3xl border-4 border-white shadow-2xl ring-1 ring-slate-200" />
                <button onClick={() => setPreviewImage(null)} className="absolute -top-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-lg hover:bg-rose-700 transition-colors">
                   <X size={14} />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⌨️ INPUT AREA - Terminal Look */}
      <footer className="p-6 bg-white border-t border-slate-100 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          
          <div className="flex bg-slate-100/80 rounded-[2.2rem] p-1.5 items-center flex-1 transition-all focus-within:bg-white border border-transparent focus-within:border-blue-500 focus-within:ring-[6px] focus-within:ring-blue-500/5 shadow-inner relative">
            
            <button onClick={() => setShowSafePicker(true)} className="p-3 text-blue-600 hover:bg-white hover:shadow-md rounded-full transition-all group relative">
              <ShieldCheck size={22} strokeWidth={2.5} />
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 pointer-events-none whitespace-nowrap font-black uppercase tracking-widest shadow-xl">
                 Secure Meeting Zone
              </div>
            </button>

            <button onClick={() => fileInputRef.current.click()} className="p-3 text-slate-400 hover:text-blue-600 transition-colors">
              <Paperclip size={20} strokeWidth={2.5} />
            </button>
            <input type="file" hidden ref={fileInputRef} onChange={(e) => {
                const reader = new FileReader();
                reader.onload = () => setPreviewImage(reader.result);
                reader.readAsDataURL(e.target.files[0]);
            }} accept="image/*" />

            <input 
              className="flex-1 bg-transparent py-3.5 px-3 outline-none text-sm font-black placeholder:text-slate-400 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest" 
              value={message} onChange={(e) => setMessage(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Transmit Message..." 
            />
            
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-3 text-slate-400 hover:text-blue-600 transition-colors">
              <Smile size={20} strokeWidth={2.5} />
            </button>
          </div>

          <button 
            onClick={() => handleSendMessage()} 
            disabled={!message.trim() && !previewImage}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${message.trim() || previewImage ? "bg-slate-900 text-white hover:bg-blue-600 active:scale-90" : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"}`}
          >
            <Send size={24} fill={message.trim() || previewImage ? "white" : "none"} className={message.trim() || previewImage ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </div>
      </footer>

      {/* 🛡️ SAFE ZONE PICKER MODAL */}
      <AnimatePresence>
        {showSafePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-lg h-[80vh] md:h-auto overflow-hidden rounded-[3rem] bg-white shadow-2xl border-4 border-white/20">
                <button onClick={() => setShowSafePicker(false)} className="absolute top-6 right-6 bg-slate-100 p-2.5 rounded-2xl shadow-xl z-[110] text-slate-500 hover:text-rose-600 transition-all border border-white active:scale-90">
                    <X size={20} strokeWidth={3} />
                </button>
                <SafeZonePicker onSelectLocation={handleSafeZoneSelect} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🤖 Emoji Picker Overlay */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute bottom-28 right-6 z-[100] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-[2rem] overflow-hidden border-2 border-white">
            <EmojiPicker onEmojiClick={(emoji) => setMessage(prev => prev + emoji.emoji)} width={320} height={400} />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
}