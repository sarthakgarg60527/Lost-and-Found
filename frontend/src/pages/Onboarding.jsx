import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  User, MapPin, IdCard, Camera, Upload, 
  ArrowRight, Loader2, ShieldCheck, AlertTriangle, ChevronLeft, Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    bio: "",
  });
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'profile') {
        setProfileFile(file);
        setProfilePreview(URL.createObjectURL(file));
      } else {
        setIdFile(file);
        setIdPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return alert("Pehle apna sahi naam bhariye!");
    setLoading(true);
    try {
      await API.put("/users/profile", { 
        name: formData.name, 
        address: formData.address,
        bio: formData.bio 
      });

      if (profileFile) {
        const pData = new FormData();
        pData.append("profilePhoto", profileFile);
        await API.post("/users/profile-photo", pData);
      }

      if (idFile) {
        const iData = new FormData();
        iData.append("image", idFile);
        await API.post("/users/verify-request", iData);
      }

      navigate("/home"); // Success ke baad seedha dashboard/home
    } catch (err) {
      alert("Kuch gadbad ho gayi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden font-sans">
      
      {/* Background Decor (Same as Login/Register) */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-200 blur-[120px] opacity-40 rounded-full"/>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-indigo-200 blur-[120px] opacity-40 rounded-full"/>

      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl px-6 relative z-10"
      >
        {/* Progress Header */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Package size={24}/>
            </div>
            <div className="flex gap-3 w-48">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-200'}`} />
                ))}
            </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Set Profile ✨</h2>
                  <p className="text-sm text-slate-400 font-medium">Let's start with your identity</p>
                </div>

                <div className="flex flex-col items-center gap-8">
                  <label htmlFor="profile" className="relative cursor-pointer group">
                    <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-slate-50 to-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-all hover:scale-105">
                      {profilePreview ? (
                        <img src={profilePreview} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                           <Camera size={40} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Add Photo</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                        <Upload size={16} />
                    </div>
                    <input type="file" id="profile" className="hidden" onChange={(e) => handleFileChange(e, 'profile')} accept="image/*" />
                  </label>

                  <div className="w-full space-y-2">
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" name="name" placeholder="Legal Full Name" 
                        value={formData.name} onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Location 📍</h2>
                  <p className="text-sm text-slate-400 font-medium">Where are you based?</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-5 text-blue-500" size={20} />
                    <textarea 
                      name="address" placeholder="Full Address (City, Area, Pin)" rows="3"
                      value={formData.address} onChange={handleInputChange}
                      className="w-full p-4 pl-12 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none font-semibold"
                    />
                  </div>
                  <textarea 
                    name="bio" placeholder="Tell us a bit about yourself..." rows="2"
                    value={formData.bio} onChange={handleInputChange}
                    className="w-full p-4 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none font-semibold"
                  />
                </div>
              </motion.div>
            )}

           {step === 3 && (
  <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
    <div className="text-center">
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">Verify ID 🛡️</h2>
      <p className="text-sm text-slate-400 font-medium">Secure verification protocol</p>
    </div>

    {/* Warning Banner - English */}
    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
      <AlertTriangle size={20} className="text-amber-600 shrink-0" />
      <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
        Your <span className="text-amber-900 underline">ID Name</span> must match your 
        <span className="text-amber-900 underline"> Profile Name</span> exactly. 
        Mismatched requests will be automatically rejected.
      </p>
    </div>

    <label htmlFor="id-proof" className="group cursor-pointer block border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
      {idPreview ? (
        <img src={idPreview} className="h-44 w-full object-cover rounded-xl shadow-md" alt="ID Preview" />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <IdCard size={28} className="text-blue-600" />
          </div>
          <div className="space-y-1">
            <span className="block text-xs font-black text-slate-600 uppercase tracking-widest">Upload Government ID</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">(Aadhar / PAN / Driver's License)</span>
          </div>
        </div>
      )}
      <input type="file" id="id-proof" className="hidden" onChange={(e) => handleFileChange(e, 'id')} />
    </label>

    <div className="p-4 bg-slate-900 rounded-2xl flex gap-3 shadow-lg">
      <ShieldCheck size={18} className="text-blue-400 shrink-0" />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">
        Our verification team will securely review your document. 
        Your privacy is our top priority.
      </p>
    </div>
  </motion.div>
)}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={18}/>
              </button>
            )}
            
            <motion.button 
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {step === 3 ? "Complete Setup" : "Next Step"}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </div>

          <button 
            onClick={() => navigate("/home")}
            className="w-full mt-6 text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors text-center uppercase tracking-widest"
          >
            Skip for now
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex justify-center items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <ShieldCheck size={14} /> 256-bit Encrypted Setup
        </div>
      </motion.div>
    </div>
  );
}