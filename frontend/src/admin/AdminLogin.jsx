import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom"; // 🔥 Link add kiya
import { ShieldCheck, Lock, Mail, Loader2, ChevronRight } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post(
  "/auth/login",
  {
    email,
    password,
    isAdminLogin: true
  }
);
      
      // 🔥 Sabse Zaroori Logic: Role check
 if (res.data.user.role !== "admin") {

  alert(
    "ACCESS DENIED: Unauthorized Personnel Detected."
  );

  localStorage.removeItem(
    "admin_token"
  );

  localStorage.removeItem(
    "admin_data"
  );

  setLoading(false);

  return;
}



localStorage.setItem(
  "admin_token",
  res.data.token
);

localStorage.setItem(
  "admin_data",
  JSON.stringify(res.data.user)
);
     window.location.href = "/admin/dashboard";
    } catch (err) {
      alert(
    err.response?.data?.message ||
    "Login failed"
  );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[80px]"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-xl shadow-blue-900/40">
            <ShieldCheck className="text-white" size={32} />
          </div>
          
          <h1 className="text-2xl font-black text-white text-center uppercase tracking-tighter italic">HQ Command Login</h1>
          <p className="text-slate-500 text-center text-xs font-bold uppercase tracking-widest mt-2 mb-10">Restricted Area</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="email" 
                  required 
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-blue-600 transition-all font-medium"
                  placeholder="admin@foundit.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="password" 
                  required 
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-blue-600 transition-all font-medium"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Authorize Access <ChevronRight size={16}/></>
              )}
            </button>
          </form>

          {/* 🔥 REDIRECT TO SIGN UP (REGISTER) SECTION */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs font-medium">New Operative?</p>
            <Link 
              to="/admin/register" 
              className="text-blue-500 font-black uppercase text-[10px] tracking-[0.2em] mt-2 inline-block hover:text-blue-400 transition-colors"
            >
              Create HQ Account
            </Link>
          </div>
          
          <p className="text-center text-slate-600 text-[10px] font-bold uppercase mt-8 tracking-widest">FoundIt Intelligence Systems v2.0</p>
        </div>
      </div>
    </div>
  );
}