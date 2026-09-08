import { useEffect, useState, useCallback, useRef } from "react";
import API from "../services/api";
import { socket } from "../socket"; 

import AdminSidebar from "../admin/AdminSidebar";
import AdminDashboard from "../admin/AdminDashboard"; 
import UserManagement from "../admin/UserManagement";
import ItemInventory from "../admin/ItemInventory";
import AdminSupport from "../admin/AdminSupport";
import UserDossier from "../admin/UserDossier";

import { Menu, Search, Sun, Moon, Bell, Shield, X, Zap, Loader2 } from "lucide-react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("admin_active_tab") || "dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("admin_theme") || "dark");
  const [globalAlert, setGlobalAlert] = useState(null); 
  const [targetTicketId, setTargetTicketId] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Data States
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null); // 🔥 Naya State Analytics ke liye
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // 🌓 THEME ENGINE
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.backgroundColor = "#020617";
    } else {
      root.classList.remove("dark");
      root.style.backgroundColor = "#f8fafc";
    }
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  // 🔄 TAB PERSISTENCE
  useEffect(() => {
    localStorage.setItem("admin_active_tab", activeTab);
  }, [activeTab]);

  // 📡 GLOBAL SOCKET LISTENER
  useEffect(() => {
    if (!socket) return;
    const handleIncoming = (data) => {
      if (activeTabRef.current !== "help") {
        setGlobalAlert(data);
        const timer = setTimeout(() => setGlobalAlert(null), 15000); 
        return () => clearTimeout(timer);
      }
    };
    socket.on("new_ticket_alert", handleIncoming);
    socket.on("admin_agent_request", handleIncoming);
    return () => {
      socket.off("new_ticket_alert");
      socket.off("admin_agent_request");
    };
  }, []); 

  // 🚀 DATA FETCHING (Now includes Stats)
  const loadData = useCallback(async () => {
    try {
      const [uRes, iRes, sRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/items"),
        API.get("/admin/stats") // 🔥 Naya API call
      ]);
      setUsers(uRes.data);
      setItems(iRes.data);
      setStats(sRes.data); // Analytics data set karo
      setLoading(false);
    } catch (err) { 
      console.error("Sync Error:", err); 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- ACTIONS ---
  const handleIntercept = () => {
    if (globalAlert) {
      const id = globalAlert.ticketId || globalAlert._id;
      setTargetTicketId(id); 
    }
    setActiveTab("help");
    setGlobalAlert(null);
  };

 const handleUpdateKarma = async (userId, points) => {
    // 1. UI ko turant update karo (Bina refresh ke dikhega)
    setUsers(prevUsers => 
      prevUsers.map(u => u._id === userId ? { ...u, karmaPoints: u.karmaPoints + points } : u)
    );

    try {
      await API.put("/admin/update-karma", { userId, points });
      // Backend sync ke liye loadData() chala sakte ho background mein
      loadData(); 
    } catch (err) {
      alert("Karma update failed");
      loadData(); // Error aane par purana data wapas le aao
    }
  };

 const handleUserAction = async (action, id) => {
    if (!window.confirm(`Confirm ${action}?`)) return;

    try {
        // 🛑 ACTION CHECK: Backend routes se match hona chahiye
        let endpoint = "";
        if (action === "approve") endpoint = `/admin/approve/${id}`;
        else if (action === "reject") endpoint = `/admin/reject/${id}`;
        else if (action === "ban") endpoint = `/admin/toggle-ban/${id}`; // toggle-ban route ke liye

        const res = await API.put(endpoint);

        // UI update bina refresh ke
        setUsers(prev => prev.map(u => 
            u._id === id ? { 
                ...u, 
                isVerified: action === "approve" ? true : (action === "reject" || action === "ban" ? false : u.isVerified),
                verificationStatus: action === "approve" ? "approved" : (action === "reject" ? "rejected" : u.verificationStatus)
            } : u
        ));

        alert(res.data.message || "Action Successful ✅");
    } catch (err) {
        console.error("Action Error:", err);
        alert(err.response?.data?.message || "403: Access Denied. Admin Role Missing.");
    } finally {
        loadData(); 
    }
};

  if (loading) return (
    <div className={`fixed inset-0 flex items-center justify-center z-[999] ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      <Loader2 className="animate-spin text-blue-500" size={40}/>
    </div>
  );

  return (
    <div 
      className="flex min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 transition-colors duration-500 font-sans overflow-hidden relative text-left"
      style={{ backgroundColor: theme === 'dark' ? '#020617' : '#f8fafc' }}
    >
      
      {/* 🔔 GLOBAL ALERT POPUP */}
      {globalAlert && (
        <div className="fixed top-6 right-6 z-[9999] w-[350px] bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-[0_20px_50px_rgba(59,130,246,0.3)] rounded-[2.5rem] p-6 animate-in slide-in-from-right-20">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <Bell className="animate-bounce" size={24}/>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Signal</p>
                <h4 className="text-sm font-black dark:text-white text-slate-900 uppercase">Support Req.</h4>
              </div>
            </div>
            <button onClick={() => setGlobalAlert(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
            Operative <span className="font-bold text-slate-900 dark:text-white">{globalAlert.user || "User"}</span> is requesting immediate assistance.
          </p>
          <button 
            onClick={handleIntercept}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Zap size={14}/> Intercept Matrix
          </button>
        </div>
      )}

      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col relative overflow-hidden h-screen">
        {activeTab !== "help" && (
          <header className="bg-white/70 dark:bg-[#020617]/70 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center backdrop-blur-xl z-20 sticky top-0">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-blue-500 transition-all"
              >
                <Menu size={20}/>
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-red-500 mb-0.5 tracking-widest">Control Center</span>
                <div className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield size={18} className="text-red-500"/>
                  {activeTab} <span className="font-thin text-slate-400">Node</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-all"
              >
                {theme === "dark" ? <Sun className="text-yellow-500" size={20}/> : <Moon className="text-blue-600" size={20}/>}
              </button>
              <div className="relative w-64 hidden lg:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Query database..." className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-12 py-3 rounded-2xl text-xs outline-none focus:border-red-500 dark:text-white transition-all"/>
              </div>
            </div>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto custom-scrollbar ${activeTab === "help" ? "" : "p-10"}`}>
          <div className="max-w-[1600px] mx-auto">
            {/* 🔥 Dashboard ko ab stats bhej rahe hain */}
            {activeTab === "dashboard" && <AdminDashboard stats={stats} users={users} items={items} />}
            
            {activeTab === "users" && <UserManagement users={users} onSelectUser={(u) => setSelectedUser(u)} onUpdateKarma={handleUpdateKarma} onAction={handleUserAction} />}
            {activeTab === "items" && (
  <ItemInventory 
    items={items} 
    onDelete={(id) => { 
      if(window.confirm("Delete record?")) API.delete(`/admin/items/${id}`).then(loadData) 
    }} 
    // 🔥 YE LINE UPDATE KARO
    onSelectUser={(u) => {
      setSelectedUser(u);
      // Agar ItemInventory modal khula hai, toh wo automatically UserDossier ke peeche chala jayega
      // kyunki UserDossier ka z-index hum 150 rakhenge.
    }}
  />
)}
            {activeTab === "help" && (
              <AdminSupport 
                setActiveTab={setActiveTab} 
                autoSelectId={targetTicketId} 
                onAutoSelectComplete={() => setTargetTicketId(null)} 
              />
            )}
          </div>
        </div>
      </main>

    {/* UserDossier Modal - Improved Logic */}
{/* AdminPanel.jsx mein UserDossier ka render part */}
{selectedUser && activeTab !== "help" && (
  <UserDossier 
    // 🔥 Database se asli user dhundo uski ID match karke
    user={users.find(u => u._id === (selectedUser._id || selectedUser)) || selectedUser} 
    items={items} 
    onClose={() => setSelectedUser(null)} 
    onUpdateKarma={handleUpdateKarma} 
    onAction={handleUserAction} 
  />
)}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${theme === 'dark' ? '#1e293b' : '#cbd5e1'}; 
          border-radius: 10px; 
        }
      `}</style>
    </div>
  );
}