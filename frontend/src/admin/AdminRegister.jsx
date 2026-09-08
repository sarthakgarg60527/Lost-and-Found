import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, User, Mail, Lock, Key, Loader2, ChevronRight, AlertTriangle, Phone } from "lucide-react";

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "", // 👈 Fixed: Phone field added to state
    adminSecretKey: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend par check hoga: agar secret key galat hai toh 403 error aayega
      const res = await API.post("/auth/register", { 
        ...formData, 
        role: "admin" 
      });
      
      alert("HQ AUTHENTICATED: Admin Account Created.");
      navigate("/admin/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed: Check details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        
        {/* Background Decorative Blur */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[80px]"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
              <ShieldCheck className="text-blue-500" size={32} />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white text-center uppercase tracking-tighter italic">Create HQ Operative</h1>
          <p className="text-slate-500 text-center text-[10px] font-bold uppercase tracking-[0.2em] mt-2 mb-8">Secure Admin Enrollment</p>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Operative Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="text" required
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-600 transition-all font-medium"
                  placeholder="Super Admin"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Admin Node (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="email" required
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-600 transition-all font-medium"
                  placeholder="admin@foundit.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
               {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Security Key (Password)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="password" required
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-600 transition-all font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* 🔥 Contact Number (Satisfies Mongoose Validation) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Contact Protocol (Phone)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="text" required
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-600 transition-all font-medium"
                  placeholder="+91 00000 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

         

            {/* SECRET ADMIN KEY */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-black text-orange-500 uppercase ml-1 flex items-center gap-1">
                <AlertTriangle size={10}/> Authorization Secret Key
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" size={18} />
                <input 
                  type="text" required
                  className="w-full bg-orange-500/5 border border-orange-500/20 text-orange-100 pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-orange-500 transition-all font-medium placeholder:text-orange-900"
                  placeholder="Enter HQ-SECRET-KEY"
                  value={formData.adminSecretKey}
                  onChange={(e) => setFormData({...formData, adminSecretKey: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Deploy Admin Account <ChevronRight size={16}/></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-800 pt-6">
            <p className="text-slate-500 text-xs font-medium">Already have access?</p>
            <Link to="/admin/login" className="text-blue-500 font-black uppercase text-[10px] tracking-widest hover:text-blue-400 mt-2 inline-block">Return to Command Center</Link>
          </div>
        </div>
      </div>
    </div>
  );
}