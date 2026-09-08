import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

import {
  Trophy, User, Loader2, Sparkles, Crown,
  LayoutDashboard, MessageSquare, Plus,
  LogOut, MapPin, HelpCircle, Package, ChevronRight
} from "lucide-react";

export default function Leaderboard() {
  const navigate = useNavigate();

  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true); // Period change hone par bhi loading dikhao
    try {
      const res = await API.get(`/users/leaderboard?period=${period}`);
      setLeaders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const myRank = leaders.findIndex(
    l => l._id === (currentUser._id || currentUser.id)
  ) + 1;

  // ✅ COMMON LAYOUT WRAPPER (Blink Se Bachne Ke Liye)
  return (
    <div className="flex min-h-screen bg-[#F6F7FB] text-slate-800 font-sans">
      
      {/* 1. SIDEBAR (Fixed: No Blink) */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col bg-white border-r shrink-0">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Trophy size={18}/>
            </div>
            <div>
              <h1 className="font-bold text-lg">FoundIt</h1>
              <p className="text-xs text-slate-400">Lost & Found Network</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button onClick={() => navigate("/home")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600">
            <LayoutDashboard size={18}/> Dashboard
          </button>
          <button onClick={() => navigate("/profile")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600">
            <User size={18}/> Profile
          </button>
          <button onClick={() => navigate("/leaderboard")} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium w-full">
            <Trophy size={18}/> Leaderboard
          </button>
          <button onClick={() => navigate("/nearby")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600">
            <MapPin size={18}/> Nearby Items
          </button>
          <button onClick={() => navigate("/inbox")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600">
            <MessageSquare size={18}/> Messages
          </button>
          <button onClick={() => navigate("/create")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600">
            <Plus size={18}/> Report Item
          </button>
        </nav>

        <div className="p-4 border-t space-y-1">
          <button onClick={() => navigate("/help")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full text-slate-600 font-medium transition-all">
            <HelpCircle size={18} /> Help & Support
          </button>
          <button onClick={() => { if (window.confirm("Logout?")) { localStorage.clear(); navigate("/login"); } }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full font-medium transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b px-8 py-6 h-[89px] flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="font-semibold text-lg">LeaderBoard</h2>
            <p className="text-sm text-slate-400">Community Standings</p>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border">
            {["weekly", "monthly", "yearly"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${period === p ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>{p}</button>
            ))}
          </div>
        </header>

        <main className="p-8 w-full max-w-6xl mx-auto space-y-8">
          {loading ? (
            /* ✅ Leaderboard Skeleton (Podium + Table) */
            <div className="space-y-8 animate-pulse">
               <div className="bg-white rounded-3xl h-64 w-full shadow-sm" />
               <div className="bg-white rounded-2xl h-24 w-full shadow-sm" />
               <div className="bg-white rounded-3xl h-80 w-full shadow-sm" />
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* HERO / PODIUM AREA */}
              <div className="bg-white rounded-3xl pt-10 pb-10 px-10 text-center shadow-sm border overflow-hidden relative">
                <div className="flex justify-center mb-10">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                    <Sparkles size={14} className="text-blue-500"/>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Global Top Performers</span>
                  </div>
                </div>

                <div className="flex items-end justify-center gap-6 md:gap-16 mt-6">
                  {/* 2nd */}
                  {leaders[1] && (
                    <div className="flex flex-col items-center group">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-4 border-slate-200 mb-3 shadow-lg group-hover:scale-105 transition-transform">
                        <img src={leaders[1].profileImage || "/default-avatar.png"} className="w-full h-full object-cover"/>
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 mb-2 truncate max-w-[80px]">{leaders[1].name}</p>
                      <div className="bg-slate-200 h-24 w-20 md:w-24 rounded-t-2xl flex flex-col items-center justify-center shadow-inner">
                        <span className="text-2xl font-black text-slate-400">2</span>
                      </div>
                    </div>
                  )}

                  {/* 1st */}
                  {leaders[0] && (
                    <div className="flex flex-col items-center scale-110 group relative z-10">
                      <Crown className="text-yellow-500 mb-2 drop-shadow-md animate-bounce duration-[2000ms]"/>
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden border-4 border-yellow-400 mb-3 shadow-2xl shadow-yellow-100 group-hover:scale-105 transition-transform">
                        <img src={leaders[0].profileImage || "/default-avatar.png"} className="w-full h-full object-cover"/>
                      </div>
                      <p className="text-xs font-black text-slate-900 mb-2 truncate max-w-[100px]">{leaders[0].name}</p>
                      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 h-32 w-24 md:w-28 rounded-t-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl">1</div>
                    </div>
                  )}

                  {/* 3rd */}
                  {leaders[2] && (
                    <div className="flex flex-col items-center group">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-4 border-orange-200 mb-3 shadow-lg group-hover:scale-105 transition-transform">
                        <img src={leaders[2].profileImage || "/default-avatar.png"} className="w-full h-full object-cover"/>
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 mb-2 truncate max-w-[80px]">{leaders[2].name}</p>
                      <div className="bg-orange-200 h-20 w-20 md:w-24 rounded-t-2xl flex items-center justify-center shadow-inner">
                        <span className="text-2xl font-black text-orange-400">3</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* YOUR RANK CARD */}
              <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm"><Trophy size={24}/></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your Position</p>
                    <h3 className="text-xl font-bold">Rank <span className="text-blue-600">#{myRank || "NA"}</span></h3>
                  </div>
                </div>
                <button onClick={() => navigate("/profile")} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">View Stats</button>
              </div>

              {/* TABLE */}
              <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
                <div className="grid grid-cols-12 p-5 bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="col-span-1">Pos</div>
                  <div className="col-span-8">Intelligence Agent</div>
                  <div className="col-span-3 text-right">Karma Points</div>
                </div>
                <div className="divide-y">
                  {leaders.map((user, index) => (
                    <div key={user._id} className={`grid grid-cols-12 px-6 py-5 items-center transition-all hover:bg-slate-50 cursor-default ${user._id === (currentUser._id || currentUser.id) ? "bg-blue-50/50" : ""}`}>
                      <div className="col-span-1 font-black text-slate-300 text-sm">#{index + 1}</div>
                      <div className="col-span-8 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border">
                          <img src={user.profileImage || "/default-avatar.png"} className="w-full h-full object-cover"/>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{user.rank || "Guardian Agent"}</p>
                        </div>
                      </div>
                      <div className="col-span-3 text-right font-black text-blue-600 text-base">{user.karmaPoints}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}