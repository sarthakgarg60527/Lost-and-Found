import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Shield, Bell, ArrowRight, CheckCircle, 
  Globe, Package, Zap 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* 🟢 NAVBAR - Refined Glassmorphism */}
      <nav className="flex justify-between items-center px-6 md:px-16 py-4 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
            <Package size={20} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">
            Found<span className="text-blue-600">it</span>
          </span>
        </div>

        <div className="hidden md:flex gap-8 items-center text-[13px] font-bold uppercase tracking-wider text-slate-500">
          <Link to="/login" className="hover:text-blue-600 transition-colors">Sign in</Link>
          <Link to="/register">
            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-full hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* 🔵 HERO SECTION - Polished Typography */}
      <section className="px-6 pt-24 pb-24 md:pt-36 md:pb-48 flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-100/40 blur-[120px] -z-10 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 backdrop-blur-sm"
        >
          <span className="text-[10px] font-extrabold text-blue-700 flex items-center gap-2 uppercase tracking-[0.2em]">
            <Zap size={14} fill="currentColor" /> India's Trusted Network
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-[5.5rem] font-[1000] mb-6 tracking-[ -0.04em] text-slate-900 max-w-4xl leading-[0.95]"
        >
          Lose something? <br />
          <span className="text-blue-600 drop-shadow-sm">Let's find it back.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500/80 max-w-2xl text-lg md:text-xl mb-12 leading-relaxed font-medium"
        >
          The fastest way to report lost items and connect with finders in your area. Simple, secure, and built for the community.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/register">
            <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)]">
              Register <ArrowRight size={20} />
            </button>
          </Link>
          <Link to="/login">
            <button className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-200 transition-all">
              Login
            </button>
          </Link>
        </motion.div>
      </section>

      {/* 📊 STATS SECTION - Minimalist Style */}
      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { num: "5,000+", label: "Items returned", icon: <CheckCircle size={28} className="text-emerald-500" /> },
            { num: "12,000", label: "Active users", icon: <Globe size={28} className="text-blue-500" /> },
            { num: "98%", label: "Success rate", icon: <Shield size={28} className="text-blue-600" /> }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center md:items-start group">
              <div className="mb-5 bg-slate-50 p-4 rounded-2xl transition-colors group-hover:bg-blue-50">
                {stat.icon}
              </div>
              <h2 className="text-5xl font-black mb-1 text-slate-900 tracking-tighter italic">{stat.num}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🛠 FEATURES GRID - Cards Refined */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">Smart. Fast. Secure.</h2>
            <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                title: "Instant Alerts", 
                desc: "Get notified immediately when someone posts a match for your lost item.",
                icon: <Bell size={28} />,
                color: "bg-blue-50 text-blue-600"
              },
              { 
                title: "Safe Pickups", 
                desc: "Integrated verification steps to ensure items reach their rightful owners.",
                icon: <Shield size={28} />,
                color: "bg-indigo-50 text-indigo-600"
              },
              { 
                title: "Advanced Search", 
                desc: "Filter by location, date, and category to find items in seconds.",
                icon: <Search size={28} />,
                color: "bg-emerald-50 text-emerald-600"
              }
            ].map((f, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] border border-slate-100 bg-white hover:border-blue-200/60 hover:shadow-[0_32px_64px_-20px_rgba(0,0,0,0.06)] transition-all duration-300">
                <div className={`mb-8 w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-black mb-4 text-slate-900 tracking-tight uppercase italic">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 FINAL CALL TO ACTION - High Impact */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3rem] py-24 px-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />
          
          <h2 className="text-5xl md:text-6xl font-black text-white mb-10 relative z-10 tracking-tighter uppercase italic">
            Ready to find your <br /> belongings?
          </h2>
          <Link to="/register" className="relative z-10">
            <button className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-900/40">
              Create Free Account
            </button>
          </Link>
        </div>
      </section>

      {/* 🏮 CLEAN FOOTER */}
      <footer className="px-6 md:px-16 py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Package size={16} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Foundit</span>
          </div>
          
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">
            © 2026 Foundit Recovery Network. 
          </p>
          
          <div className="flex gap-8 text-slate-400 text-[11px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}