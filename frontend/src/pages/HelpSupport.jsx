import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { socket } from "../socket";
import { 
  Package, LayoutDashboard, User, Trophy, MapPin, 
  MessageSquare, Plus, HelpCircle, LogOut, Send, 
  History, ShieldCheck, CheckCircle2, X, Bot, Headset, Loader2, Sparkles, Zap, FileText, ChevronRight
} from "lucide-react";

export default function HelpSupport() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  
  // Core States
  const [activeTab, setActiveTab] = useState("guides");
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  // Connection States
  const [isAgentLinked, setIsAgentLinked] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userInitials = userData?.name ? userData.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "??";

  // 1. Initial Load: Private Room Join & History
  useEffect(() => { 
    fetchHistory(); 
    if (userData?._id) socket.emit("join_private_room", userData._id);
  }, []);

  // 2. 🔥 REAL-TIME ENGINE: Fixed Functional Updates
  useEffect(() => {
    const handleNewMessage = (data) => {
      fetchHistory(); // Archive update in background

  setActiveTicket((prev) => {
  if (!prev || prev._id !== data.ticketId) return prev;

  const isDuplicate = prev.messages.some(
    (m) =>
      m.text === data.text &&
      m.sender === data.sender &&
      Math.abs(new Date(m.createdAt) - new Date(data.createdAt)) < 2000
  );

  if (isDuplicate) return prev;

  return {
    ...prev,
    messages: [...prev.messages, data],
    status: data.status || prev.status,
  };
});
    };

    const handleAgentJoined = (data) => {
      setActiveTicket((prev) => {
        if (prev && prev._id === data.ticketId) {
          setIsConnecting(false);
          setIsAgentLinked(true);
          return { ...prev, status: "active" };
        }
        return prev;
      });
      fetchHistory();
    };

    socket.on("receive_support_message", handleNewMessage);
    socket.on("agent_joined_chat", handleAgentJoined);

    return () => {
      socket.off("receive_support_message", handleNewMessage);
      socket.off("agent_joined_chat", handleAgentJoined);
    };
  }, []);

  // 3. 🔥 ROOM SYNC: Joins the specific room whenever activeTicket changes
  useEffect(() => {
    if (activeTicket?._id) {
      // Backend joins rooms as `ticket_${id}`
      socket.emit("join_support_ticket", activeTicket._id);
      
      const isActuallyActive = activeTicket.status === "active";
      setIsAgentLinked(isActuallyActive);
      if (isActuallyActive) setIsConnecting(false);
    } else {
      setIsAgentLinked(false);
      setIsConnecting(false);
    }
  }, [activeTicket?._id, activeTicket?.status]);

  // 4. Scroll to Bottom
  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [activeTicket?.messages]);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/support/my-history");
      setHistory(res.data);
    } catch (err) { console.error("Archive Error"); } finally { setFetching(false); }
  };

  const handleInstantQuery = async (sug) => {
    setLoading(true);
    try {
      const res = await API.post("/support/create", { ...sug, priority: "High" });
      setActiveTicket(res.data);
      setActiveTab("support");
      fetchHistory();
    } catch (err) { alert("Dispatch failed."); } finally { setLoading(false); }
  };

  const handleAgentConnect = async () => {
    if (!activeTicket) return;
    setIsConnecting(true); 
    try {
      await API.patch(`/support/ticket/${activeTicket._id}/request-agent`); 
    } catch (err) { 
      setIsConnecting(false); 
      alert("Signal failed.");
    }
  };

const handleSendReply = async () => {
  if (!replyText.trim() || !activeTicket) return;

  const textToSend = replyText;

  const tempMessage = {
    _id: Date.now(), // temporary id
    text: textToSend,
    sender: "user",
    createdAt: new Date()
  };

  // ✅ INSTANT UI UPDATE
  setActiveTicket(prev => ({
    ...prev,
    messages: [...prev.messages, tempMessage]
  }));

  setReplyText("");

  try {
    await API.post(`/support/message/${activeTicket._id}`, { 
      text: textToSend, 
      sender: "user" 
    });
  } catch (err) { 
    console.error("Transmission failed");
  }
};

  const chatSuggestions = [
    { label: "Talk to Agent", subject: "Live Support Request", message: "Hi HQ, I need real-time assistance regarding my account.", category: "General Inquiry" },
    { label: "ID Verification", subject: "Verification Status", message: "My ID verification is pending.", category: "Verification" },
    { label: "Report Fraud", subject: "Suspicious Activity", message: "Reporting a false claim post.", category: "Claim Dispute" },
    { label: "Technical Bug", subject: "App Glitch", message: "The map interface is not loading.", category: "Technical Issue" }
  ];

  const isHelpActive = activeTab === "guides" || activeTab === "support" || activeTicket !== null;
  const showConnectButton = 
  activeTicket?.messages.some(m => m.sender === "admin") && 
  activeTicket?.status !== "active" && 
  activeTicket?.status !== "requesting";

  return (
    <div className="flex h-screen w-full bg-[#F6F7FB] text-slate-800 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col bg-white border-r shrink-0">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow"><Package size={18} /></div>
          <div><h1 className="text-lg font-bold text-slate-900">FoundIt</h1><p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-[10px]">HQ Ops Command</p></div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            {n:"Dashboard",i:<LayoutDashboard size={18}/>,p:"/home"},
            {n:"Profile",i:<User size={18}/>,p:"/profile"},
            {n:"Leaderboard",i:<Trophy size={18}/>,p:"/leaderboard"},
            {n:"Nearby Items",i:<MapPin size={18}/>,p:"/nearby"},
            {n:"Messages",i:<MessageSquare size={18}/>,p:"/inbox"},
            {n:"Report Item",i:<Plus size={18}/>,p:"/create"}
          ].map((item) => (
            <button key={item.n} onClick={() => navigate(item.p)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600 italic">
              {item.i} {item.n}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t space-y-1">
          <button 
            onClick={() => { setActiveTab("guides"); setActiveTicket(null); }} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full font-bold transition-all ${isHelpActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <HelpCircle size={18} className={isHelpActive ? "text-blue-600" : "text-slate-500"} />
            <span>Help & Settings</span>
          </button>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-all font-medium"><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b px-8 py-5 flex justify-between items-center shrink-0 z-10">
          <div><h2 className="text-xl font-semibold text-slate-900 italic tracking-tighter">Support Center</h2></div>
          <div onClick={() => navigate("/profile")} className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold cursor-pointer">{userInitials}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 w-full scrollbar-hide bg-[#FDFDFF]">
          <div className="flex gap-8 border-b border-slate-200 mb-8 w-full">
            <button onClick={() => {setActiveTab("guides"); setActiveTicket(null);}} className={`pb-4 text-sm font-semibold transition-all px-2 ${activeTab === "guides" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}>System Protocol</button>
            <button onClick={() => {setActiveTab("support");}} className={`pb-4 text-sm font-semibold transition-all px-2 ${activeTab === "support" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}>Intelligence Dispatch</button>
          </div>

          {activeTab === "guides" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                 <InstructionCard 
  icon={<Plus size={20} className="text-blue-600"/>} 
  title="Reporting Guide" 
  steps={[
    "Go to the Report Section", 
    "Upload clear photos of the item", 
    "Ensure GPS location is enabled", 
    "Wait for Admin team verification"
  ]} 
/>

<InstructionCard 
  icon={<Zap size={20} className="text-orange-500"/>} 
  title="Karma Rewards" 
  steps={[
    "Successful Handover: +50 XP", 
    "Identity Verification: +100 XP", 
    "Earn points to level up your Rank", 
    "High Rank users get VIP Live Support"
  ]} 
/>

<InstructionCard 
  icon={<ShieldCheck size={20} className="text-emerald-500"/>} 
  title="Security Protocols" 
  steps={[
    "All chats are fully encrypted", 
    "Personal data is always masked", 
    "Use Secret Codes for handovers", 
    "Get Verified to build community trust"
  ]} 
/>

<InstructionCard 
  icon={<FileText size={20} className="text-slate-500"/>} 
  title="Claiming Process" 
  steps={[
    "Provide solid proof of ownership", 
    "Wait for HQ to validate your claim", 
    "Coordinate with the finder via chat", 
    "Verify the unique Handover Code"
  ]} 
/>
              </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 h-full max-h-[750px]">
               {/* CHAT MAIN BOX */}
               <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[550px]">
                  {activeTicket ? (
                    <div className="flex flex-col h-full animate-in zoom-in duration-200">
                       <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isAgentLinked ? 'bg-emerald-600 animate-pulse' : 'bg-blue-600'} text-white shadow-sm`}>
                               {isAgentLinked ? <Headset size={20}/> : <Bot size={20}/>}
                             </div>
                             <div>
                               <h4 className="font-bold text-sm text-slate-800">{isAgentLinked ? "Live Operative Linked" : "Automated Hub"}</h4>
                               <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{activeTicket.ticketId}</p>
                             </div>
                          </div>
                          <button onClick={() => setActiveTicket(null)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><X size={18}/></button>
                       </div>

                       <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDFDFF] custom-scrollbar">
                          {activeTicket.messages.map((m, i) => (
                             <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${m.sender === "user" ? "bg-blue-600 text-white rounded-tr-none shadow-blue-200 shadow-lg" : "bg-white text-slate-800 rounded-tl-none border shadow-sm"}`}>
                                   {m.text}
                                   <p className="text-[9px] mt-2 opacity-50 text-right font-bold italic">{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                </div>
                             </div>
                          ))}

                          {showConnectButton && !isConnecting && !isAgentLinked && (
                            <div className="flex flex-col items-center py-10 space-y-3 animate-in zoom-in">
                               <div className="p-3 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shadow-sm animate-bounce"><Sparkles size={24}/></div>
                               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Admin response detected.<br/>Secure live link ready.</p>
                               <button onClick={handleAgentConnect} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
                                  Connect to Agent
                               </button>
                            </div>
                          )}

                          {isConnecting && !isAgentLinked && (
                            <div className="flex justify-start">
                               <div className="bg-slate-50 border p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                                  <Loader2 size={16} className="animate-spin text-blue-600"/>
                                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic">Bridging secure HQ link...</p>
                               </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                       </div>

                       <div className="p-4 border-t bg-white h-24 flex items-center">
                          {isAgentLinked ? (
                            <div className="flex gap-3 w-full animate-in slide-in-from-bottom-2">
                               <input value={replyText} onChange={(e)=>setReplyText(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&handleSendReply()} className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm outline-none focus:ring-2 ring-blue-500/20 font-medium" placeholder="Type your secure message..." />
                               <button onClick={handleSendReply} className="bg-slate-900 text-white px-6 rounded-xl shadow-lg hover:bg-blue-600 transition-all active:scale-95"><Send size={20}/></button>
                            </div>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 italic"><ShieldCheck size={12}/> Interaction Locked // Link Pending</p>
                            </div>
                          )}
                       </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/20 text-center animate-in fade-in">
                       <Bot size={48} className="text-blue-600 mb-6 opacity-40"/>
                       <h3 className="text-xl font-bold text-slate-800 uppercase italic tracking-tighter">HQ Hub</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mt-8">
                          {chatSuggestions.map((sug, idx) => (
                             <button key={idx} onClick={() => handleInstantQuery({ subject: sug.subject, message: sug.message, category: sug.category })} className="bg-white border border-slate-200 p-5 rounded-2xl text-left hover:border-blue-500 hover:shadow-lg transition-all group flex items-center justify-between shadow-sm">
                                <div><p className="text-[10px] font-black text-blue-600 uppercase mb-0.5">{sug.label}</p><p className="text-xs text-slate-500 font-bold line-clamp-1">{sug.subject}</p></div>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-all" />
                             </button>
                          ))}
                       </div>
                    </div>
                  )}
               </div>

               {/* RIGHT ARCHIVE */}
               <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 flex flex-col h-full min-h-[550px] overflow-hidden">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 tracking-tighter uppercase italic mb-6"><History size={16} className="text-slate-400"/> Dispatch Archive</h3>
                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {history.map(item => (
                       <div key={item._id} onClick={() => { setActiveTab("support"); setActiveTicket(item); }} className={`p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${activeTicket?._id === item._id ? 'border-blue-600 bg-white shadow-xl scale-[1.02]' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'}`}>
                          <div className="flex justify-between items-center mb-1.5">
                             <span className={`text-[10px] font-black uppercase ${activeTicket?._id === item._id ? 'text-blue-600' : 'text-slate-400'}`}>{item.ticketId}</span>
                             <span className={`w-2.5 h-2.5 rounded-full ${item.status === 'resolved' ? 'bg-green-500 shadow-sm' : item.status === 'active' ? 'bg-blue-500 shadow-sm animate-pulse' : 'bg-orange-500 shadow-sm'}`} />
                          </div>
                          <p className="text-xs font-bold truncate text-slate-800 uppercase tracking-tight italic">{item.subject}</p>
                       </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function InstructionCard({icon, title, steps}) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors shadow-sm">{icon}</div>
       <h3 className="font-black text-slate-900 mb-6 uppercase text-[12px] tracking-widest">{title}</h3>
       <ul className="space-y-4">
          {steps.map((step, idx) => (
             <li key={idx} className="flex items-start gap-4 text-[11px] font-bold text-slate-500 leading-tight">
                <span className="w-5 h-5 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm">{idx + 1}</span>
                <span className="mt-0.5">{step}</span>
             </li>
          ))}
       </ul>
    </div>
  );
}