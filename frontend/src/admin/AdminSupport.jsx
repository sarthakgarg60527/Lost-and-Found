import { useEffect, useState, useRef, useCallback } from "react";
import API from "../services/api";
import { socket } from "../socket";
import { 
  MessageSquare, Loader2, ShieldAlert, Zap, Send, User, Circle, X, 
  Terminal, ChevronRight, Copy, History, Fingerprint, Mail, Award, 
  ArrowLeft, Calendar, Clock, CheckCheck, ShieldCheck, Bell 
} from "lucide-react";

export default function AdminSupport({ setActiveTab, autoSelectId, onAutoSelectComplete }) {
  const [reports, setReports] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState({ priority: "", status: "all" }); 
  const [notification, setNotification] = useState(null); 
  const [showAudit, setShowAudit] = useState(false); 
  const [showIntel, setShowIntel] = useState(false);
  const chatEndRef = useRef(null);
  const activeTicketIdRef = useRef(null);

  // 1. Join and Auto-Select Logic (Dashboard Alert link)
  useEffect(() => {
    if (autoSelectId && reports.length > 0) {
      const target = reports.find(t => t._id === autoSelectId || t.ticketId === autoSelectId);
      if (target) {
        setActiveTicket(target);
        socket.emit("join_support_ticket", target._id); 
        if (typeof onAutoSelectComplete === "function") onAutoSelectComplete();
      }
    }
  }, [autoSelectId, reports, onAutoSelectComplete]);

  useEffect(() => {
    activeTicketIdRef.current = activeTicket?._id;
  }, [activeTicket]);

  // 2. Data Fetching
  const fetchReports = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await API.get(`/admin/reports?priority=${filter.priority}&status=${filter.status}`);
      setReports(res.data);
      
      if (activeTicketIdRef.current) {
        const updated = res.data.find(t => t._id === activeTicketIdRef.current);
        if (updated) {
          setActiveTicket(prev => JSON.stringify(prev) !== JSON.stringify(updated) ? updated : prev);
        }
      }
    } catch (err) {
      console.error("Signal Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter.status, filter.priority]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // 3. Real-time Socket Engine
  useEffect(() => {
    if (!socket) return;
    socket.on("new_ticket_alert", () => fetchReports(true));
    socket.on("receive_support_message", () => fetchReports(true)); // Sidebar refresh
    socket.on("admin_agent_request", (data) => {
        setNotification(data); 
        fetchReports(true); 
    });

    return () => {
        socket.off("new_ticket_alert");
        socket.off("receive_support_message");
        socket.off("admin_agent_request");
    };
  }, [fetchReports]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeTicket?.messages]);

  // 4. Chat Actions
  const handleSendReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    const msg = replyText; 
    setReplyText(""); 
    try {
      await API.post(`/support/message/${activeTicket._id}`, { text: msg, sender: "admin" });
    } catch (err) { console.error("Transmission failed"); }
  };

  const handleJoinChat = async (ticketId) => {
    try {
      const id = typeof ticketId === 'string' ? ticketId : ticketId._id;
      const res = await API.patch(`/admin/ticket/${id}/join`);
      setActiveTicket(res.data);
      socket.emit("join_support_ticket", id);
      setNotification(null); 
      fetchReports(true);
    } catch (err) { alert("Handshake Failed."); }
  };

  const handleSelectTicket = async (ticket) => {
  setActiveTicket(ticket);
  setShowIntel(false); // Nayi ticket par side panel reset
  socket.emit("join_support_ticket", ticket._id);

  
};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("UID COPIED");
  };

  if (loading) return (
    <div className="fixed inset-0 bg-white dark:bg-[#020617] flex items-center justify-center z-[200]">
      <Loader2 className="animate-spin text-blue-500" size={40}/>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-300 flex overflow-hidden font-sans border-t border-slate-200 dark:border-slate-800/50 z-[100] transition-colors duration-300">
      
      {/* 🛡️ OPERATIVE AUDIT MODAL (Dossier) */}
      {showAudit && activeTicket?.user && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center bg-black/60 dark:bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl relative p-12 text-center text-left">
            <button onClick={() => setShowAudit(false)} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-all"><X size={20}/></button>
            <img src={activeTicket.user?.profileImage || `https://ui-avatars.com/api/?name=${activeTicket.user?.name}`} className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[3rem] border-4 border-white dark:border-slate-700 shadow-2xl mx-auto mb-8 object-cover" alt="audit" />
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{activeTicket.user?.name}</h2>
            <div className="grid grid-cols-2 gap-4 mt-8 text-left text-left">
              <AuditStat icon={<Mail size={16}/>} label="Email Node" value={activeTicket.user?.email} />
              <AuditStat icon={<Fingerprint size={16}/>} label="Node ID" value={activeTicket.user?._id} copy={() => copyToClipboard(activeTicket.user?._id)} />
              <AuditStat icon={<Calendar size={16}/>} label="Joined On" value={new Date(activeTicket.user?.createdAt).toLocaleDateString()} />
              <AuditStat icon={<Award size={16}/>} label="Karma Points" value={activeTicket.user?.karmaPoints || 0} />
            </div>
            <button onClick={() => setShowAudit(false)} className="mt-10 w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Close Dossier Access</button>
          </div>
        </div>
      )}

      {/* 🔔 SIGNAL POPUP (Floating Notification) */}
      {notification && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[150] w-[480px] bg-white dark:bg-slate-900 border-2 border-blue-500/50 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between animate-in slide-in-from-top-40 backdrop-blur-xl">
            <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-blue-500/10 rounded-xl"><Bell className="text-blue-500 animate-pulse" size={24}/></div>
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest text-left">Incoming Signal</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 text-left">{notification.user} is waiting...</p>
                </div>
            </div>
            <button onClick={() => handleJoinChat(notification.ticketId)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg transition-all">Intercept</button>
        </div>
      )}

      {/* 1. WHATSAPP STYLE SIDEBAR (INBOX) */}
      <aside className="w-[380px] border-r border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#020617] flex flex-col shrink-0 h-full overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { setActiveTab("dashboard"); window.location.href = "/admin/dashboard"; }} className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-red-500 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
                <ArrowLeft size={16}/> Console
            </button>
            <Circle size={8} className="fill-emerald-500 animate-pulse shadow-[0_0_10px_#10b981] text-emerald-500"/>
          </div>
          <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase p-4 rounded-2xl outline-none text-slate-600 dark:text-slate-400 focus:border-blue-500/50 transition-all">
               <option value="all">All Channels</option>
               <option value="open">New Requests</option>
               <option value="active">Live Active</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/10 dark:bg-slate-950/10">
  {reports.map((ticket) => {
    const lastMsg = ticket.messages?.[ticket.messages.length - 1];
    const isUnread = ticket.status === 'open'; // Status open matlab naya message
    
    return (
      <div 
        key={ticket._id} 
        // 🔥 FIX: handleSelectTicket function use karo taaki status 'active' ho jaye aur NEW hat jaye
        onClick={() => handleSelectTicket(ticket)} 
        className={`flex items-center gap-4 p-5 border-b border-slate-100 dark:border-slate-800/30 cursor-pointer transition-all relative ${activeTicket?._id === ticket._id ? 'bg-blue-50 dark:bg-blue-600/5' : 'hover:bg-slate-100 dark:hover:bg-slate-900/40'}`}
      >
        {activeTicket?._id === ticket._id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_15px_#3b82f6]"></div>}
        
        <div className="relative shrink-0">
          <img src={ticket.user?.profileImage || `https://ui-avatars.com/api/?name=${ticket.user?.name || 'U'}`} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-800" alt="avatar" />
          {/* Avatar par pulse icon sirf tab dikhao jab ticket 'open' ho */}
          {isUnread && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className={`text-[14px] truncate uppercase ${isUnread ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-500 dark:text-slate-400'}`}>
              {ticket.user?.name || "Establishing..."}
            </h4>
            <span className="text-[9px] font-bold text-slate-400">
              {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className={`text-[12px] truncate pr-4 text-left ${isUnread ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
              {lastMsg?.sender === 'admin' ? <span className="text-blue-500 font-black mr-1 italic">HQ:</span> : ""}
              {lastMsg?.text || ticket.subject}
            </p>
            
            {/* 🔥 NEW Badge: Sirf tab dikhega jab status 'open' ho */}
            {isUnread && (
              <div className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg shrink-0">NEW</div>
            )}
          </div>
        </div>
      </div>
    );
  })}
</div>
      </aside>

      {/* 2. MAIN TERMINAL (CHAT) AREA */}
      <main className="flex-1 flex flex-col bg-white dark:bg-[#010409] h-full overflow-hidden border-r border-slate-200 dark:border-slate-800/60 relative">
        {activeTicket ? (
          <>
            <header className="p-5 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-white dark:bg-[#020617] shrink-0 z-10">
              <div className="flex items-center gap-4 cursor-pointer text-left" onClick={() => setShowAudit(true)}>
                <div className="w-11 h-11 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
                    <User size={20} className="text-blue-500"/>
                </div>
                <div className="text-left">
                    <h3 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-tighter">{activeTicket.user?.name || "Anonymous OP"}</h3>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Circle size={6} className="fill-emerald-500 text-emerald-500"/> Online Protocol
                    </p>
                </div>
              </div>
              <button onClick={() => setActiveTicket(null)} className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-all"><X size={20}/></button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-chat-pattern custom-scrollbar flex flex-col">
              {activeTicket.messages?.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-[14px] shadow-sm relative ${
                      msg.sender === 'admin' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10' 
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-tl-none'
                    }`}>
                    <p className="leading-relaxed text-left">{msg.text}</p>
                    <div className={`text-[9px] mt-2 flex justify-end items-center gap-1 ${msg.sender === 'admin' ? 'text-blue-100' : 'text-slate-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender === 'admin' && <CheckCheck size={12}/>}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <footer className="p-8 bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800/60 shrink-0">
              <div className="relative group max-w-4xl mx-auto flex gap-4">
                <input 
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()} 
                    placeholder="TRANSMIT SECURE MESSAGE..." 
                    className="flex-1 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800 p-5 px-8 rounded-2xl text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-500" 
                />
                <button onClick={handleSendReply} className="p-5 bg-blue-600 text-white rounded-2xl active:scale-95 transition-all shadow-xl shadow-blue-900/20"><Send size={22}/></button>
              </div>
            </footer>
          </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                <Terminal size={100} className="text-slate-400 mb-6"/>
                <h3 className="font-black uppercase tracking-[0.8em] text-xs text-center">Awaiting Node Selection</h3>
            </div>
        )}
      </main>

      {/* 3. RIGHT SIDEBAR (INTEL PANEL) */}
      {activeTicket && (
        <aside className="w-[350px] bg-white dark:bg-[#020617] flex flex-col shrink-0 h-full animate-in slide-in-from-right duration-300 lg:flex hidden overflow-hidden">
           <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
              <ShieldCheck size={22} className="text-blue-500"/>
              <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest text-left">Signal Intel</h2>
           </div>
           <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="text-center">
                 <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 mx-auto mb-6 overflow-hidden shadow-xl group cursor-pointer transition-all hover:border-blue-500" onClick={() => setShowAudit(true)}>
                    <img src={activeTicket.user?.profileImage || `https://ui-avatars.com/api/?name=${activeTicket.user?.name || 'User'}`} className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0" alt="op" />
                 </div>
                 <h3 className="text-slate-900 dark:text-white font-black text-xl uppercase tracking-tighter text-center">{activeTicket.user?.name || "Unknown OP"}</h3>
                 <p className="text-[10px] text-slate-500 font-bold mt-2 lowercase truncate block italic text-center">"{activeTicket.user?.email || "Encrypted"}"</p>
              </div>
              
              <div className="p-7 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-left relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/30"></div>
                 <p className="text-[10px] font-black text-blue-500 uppercase mb-4 tracking-widest text-left">Signal Subject</p>
                 <p className="text-[14px] text-slate-700 dark:text-slate-400 leading-relaxed italic line-clamp-10 text-left">"{activeTicket.subject}"</p>
              </div>
           </div>
        </aside>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
        .bg-chat-pattern { background-image: radial-gradient(#e2e8f0 0.5px, transparent 0.5px); background-size: 30px 30px; }
        .dark .bg-chat-pattern { background-image: radial-gradient(#1e293b 0.5px, transparent 0.5px); }
      `}</style>
    </div>
  );
}

function AuditStat({icon, label, value, copy}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-[1.5rem] group hover:border-blue-500/30 transition-all text-left">
       <div className="flex items-center gap-3 mb-2 text-left">
          <div className="text-slate-400 dark:text-slate-500">{icon}</div>
          <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-left">{label}</span>
       </div>
       <div className="flex items-center justify-between text-left">
          <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate max-w-[120px] text-left">{value || "---"}</p>
          {copy && value && <button onClick={copy} className="text-slate-400 hover:text-blue-500 transition-all"><Copy size={14}/></button>}
       </div>
    </div>
  );
}