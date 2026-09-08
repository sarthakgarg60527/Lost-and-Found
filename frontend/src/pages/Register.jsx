import { useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Mail, ChevronRight, Package, ShieldCheck, 
  Loader2, User, Phone, Eye, EyeOff, CheckCircle2 
} from "lucide-react";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  // 1. Core States
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const [otp, setOtp] = useState(""); 
  const [isOtpSent, setIsOtpSent] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // 2. Memoized Regex for Performance
  const passwordRegex = useMemo(() => 
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
  []);

  // 3. Optimized Handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleOtpChange = useCallback((e) => {
    const val = e.target.value.replace(/\D/g, ""); // Sirf numbers allow honge
    if (val.length <= 6) setOtp(val);
  }, []);

  // 4. Step 1: Registration Logic (Send OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordRegex.test(form.password)) {
      setError("Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.");
      return;
    }

    setLoading(true);
    try {
      // Data Cleaning: Backend lookup matching ke liye
      const payload = {
        ...form,
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        phone: form.phone.trim()
      };

      const res = await API.post("/auth/register", payload);
      
      // Backend status 201 (Created) ya 200 par hi next step pe bhejo
      if (res.status === 201 || res.status === 200) {
        setIsOtpSent(true);
        setError(""); // Purana error clear karo
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // 5. Step 2: OTP Verification Logic
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // FIX: Backend lookup ke liye exact match bhejo
      const res = await API.post("/auth/verify-otp", {
        email: form.email.trim().toLowerCase(),
        otp: cleanOtp
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden text-left">
      
      {/* Background Glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-blue-200 blur-[120px] opacity-40 rounded-full"/>
      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-indigo-200 blur-[120px] opacity-40 rounded-full"/>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="flex flex-col items-center text-decoration-none">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4"
            >
              <Package size={28} />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900">
              Found<span className="text-blue-600">it</span>
            </h1>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[2rem] shadow-xl">
          
          <AnimatePresence mode="wait">
            {!isOtpSent ? (
              // --- REGISTRATION FORM ---
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-2xl font-bold mb-2 text-slate-800">Create Account 👋</h2>
                <p className="text-sm text-gray-400 mb-6 font-medium">Join the Foundit network today</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 font-bold">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                  </div>

                  <div className="relative group">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                  </div>

                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email Address" required className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                  </div>

                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Password" required className="w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-400 mt-1 ml-1 leading-tight font-medium">
                    * At least 8 characters, 1 Uppercase, 1 Number & 1 Special char.
                  </p>

                  <motion.button whileTap={{ scale: 0.96 }} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-all mt-2 uppercase tracking-wider text-sm">
                    {loading ? <Loader2 className="animate-spin" /> : <>Join Now <ChevronRight size={18} /></>}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              // --- OTP VERIFICATION FORM ---
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Mail size={32} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-center text-slate-800 uppercase tracking-tight">Verify Email 📩</h2>
                <p className="text-sm text-center text-gray-400 mb-6 font-medium">
                  We've sent a 6-digit code to <br/> <span className="text-slate-800 font-bold">{form.email}</span>
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 font-bold text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      maxLength="6" 
                      value={otp} 
                      onChange={handleOtpChange} 
                      placeholder="000000" 
                      required 
                      className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-center tracking-[0.5em] font-black text-2xl text-slate-800" 
                    />
                  </div>

                  <motion.button whileTap={{ scale: 0.96 }} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-all uppercase tracking-wider text-sm">
                    {loading ? <Loader2 className="animate-spin" /> : <>Verify Account <CheckCircle2 size={18} /></>}
                  </motion.button>

                  <button 
                    type="button" 
                    onClick={() => { setIsOtpSent(false); setError(""); }} 
                    className="w-full text-xs text-gray-400 hover:text-blue-600 transition-colors font-black uppercase tracking-widest"
                  >
                    Edit Details
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6 text-sm">
            {!isOtpSent && (
              <p className="font-medium text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
          <ShieldCheck size={14} className="text-blue-500" />
          Secure Protocol Active
        </div>
      </motion.div>
    </div>
  );
}