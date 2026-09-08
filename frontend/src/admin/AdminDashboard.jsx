import { Users, Package, Clock, ShieldCheck, Banknote, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import API from "../services/api"; // Aapka API service path

export default function AdminDashboard() {
  const [data, setData] = useState({ users: [], items: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔄 Function to fetch latest data
  const fetchDashboardData = async (showPulse = false) => {
    if (showPulse) setIsUpdating(true);
    try {
      // Dono calls parallelly honge
      const [usersRes, itemsRes, statsRes] = await Promise.all([
        API.get("/admin/users"), 
        API.get("/items"), // Aapke actual endpoints
        API.get("/admin/stats")
      ]);

      setData({
        users: usersRes.data,
        items: itemsRes.data,
        stats: statsRes.data
      });
    } catch (err) {
      console.error("Auto-update failed", err);
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  // ⏱️ Auto-update logic: Har 15 seconds mein data fetch karega
  useEffect(() => {
    fetchDashboardData(); // Pehli baar load karne ke liye

    const interval = setInterval(() => {
      fetchDashboardData(true); // Background update
    }, 15000); // 15 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // calculations using fresh state
  const totalUsers = data.stats?.cards?.users || data.users.length;
  const totalItems = data.stats?.cards?.items || data.items.length;
  const successHandovers = data.stats?.cards?.successfulHandovers || data.items.filter(i => i.status === 'returned').length;
  const pendingVerifications = data.users.filter(u => !u.isVerified).length;
  const escrowHoldings = data.stats?.cards?.escrowHoldings || 0;

  if (loading) return <div className="p-20 text-center font-black animate-pulse">SYNCHRONIZING SYSTEM...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🚀 HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="text-left">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
            Command <span className="text-red-600 not-italic">Center</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
            <Activity size={12} className={`${isUpdating ? 'text-blue-500 animate-spin' : 'text-red-500 animate-pulse'}`}/> 
            {isUpdating ? "Synchronizing Data..." : "Real-time System Intelligence"}
          </p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Online</div>
           <button 
             onClick={() => fetchDashboardData(true)} 
             className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
           >
             <RefreshCw size={12} className={isUpdating ? "animate-spin" : ""} /> Update Now
           </button>
        </div>
      </div>

      {/* 📊 PRIMARY ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Active Operatives" value={totalUsers} icon={<Users size={24} className="text-blue-500"/>} glow="blue" subText="Verified across nodes" />
        <StatCard label="Total Evidence" value={totalItems} icon={<Package size={24} className="text-red-500"/>} glow="red" subText="Lost & Found reports" />
        <StatCard label="Mission Success" value={successHandovers} icon={<ShieldCheck size={24} className="text-emerald-500"/>} glow="emerald" subText="Items returned safely" />
        <StatCard label="Escrow Vault" value={`₹${escrowHoldings}`} icon={<Banknote size={24} className="text-amber-500"/>} glow="amber" subText="Secured reward capital" />
      </div>

    </div>
  );
}

// 💎 THEME ADAPTIVE PREMIUM STAT CARD
function StatCard({ label, value, icon, glow, subText }) {
  const glowMap = {
    blue: "border-blue-100 dark:border-blue-900/30 shadow-blue-500/5",
    red: "border-red-100 dark:border-red-900/30 shadow-red-500/5",
    emerald: "border-emerald-100 dark:border-emerald-900/30 shadow-emerald-500/5",
    amber: "border-amber-100 dark:border-amber-900/30 shadow-amber-500/5"
  };

  return (
    <div className={`
      relative overflow-hidden
      bg-white dark:bg-[#020617]
      border-2 ${glowMap[glow]}
      p-8 rounded-[3rem]
      flex flex-col gap-4
      shadow-2xl hover:-translate-y-2 transition-all duration-500 group
    `}>
      
      {/* BACKGROUND DECOR */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity
        ${glow === "blue" && "bg-blue-500"}
        ${glow === "red" && "bg-red-500"}
        ${glow === "emerald" && "bg-emerald-500"}
        ${glow === "amber" && "bg-amber-500"}
      `}></div>

      <div className="flex justify-between items-start relative z-10">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner group-hover:rotate-12 transition-transform duration-500">
          {icon}
        </div>
        <div className="text-right">
           <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">Live</span>
        </div>
      </div>

      <div className="space-y-1 relative z-10 text-left mt-2">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {label}
        </p>
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
          {value}
        </h2>
        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase italic mt-1">
          {subText}
        </p>
      </div>

    </div>
  );
}