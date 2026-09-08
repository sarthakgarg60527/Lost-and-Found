import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import {
  ArrowLeft, Loader2, Camera, ExternalLink, 
  Coins, MapPin, Calendar, AlignLeft, CheckCircle2
} from "lucide-react";

export default function CreateItem() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [suggestions,setSuggestions] = useState([]);
const [showMatches,setShowMatches] = useState(false);
const [aiMatches,setAiMatches] = useState([])
  
  // NEW: Location Search States
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", location: "", category: "",
    date: new Date().toISOString().split("T")[0],
    type: "lost", lat: 26.9124, lng: 75.7873,
    rewardAmount: 0
  });

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const res = await API.get("/users/profile");
       if (!res.data.isVerified) {
  alert("Please verify your account before reporting an item.");
  navigate("/profile");
}
      } catch {
        navigate("/login");
      } finally {
        setIsVerifying(false);
      }
    };
    checkVerification();
  }, [navigate]);


  // NEW: Search Function
  const handleLocationSearch = async (query) => {
    setForm({ ...form, location: query });
    if (query.length > 2) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=in&limit=5`
        );
        const data = await res.json();
        setLocationSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Location error:", err);
      }
    } else {
      setLocationSuggestions([]);
    }
  };

  const selectLocation = (loc) => {
    setForm({ 
      ...form, 
      location: loc.display_name, 
      lat: parseFloat(loc.lat), 
      lng: parseFloat(loc.lon) 
    });
    setShowSuggestions(false);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("title", form.title);
formData.append("description", form.description);
formData.append("category", form.category);
formData.append(
  "location",
  JSON.stringify({
    address: form.location,
    lat: Number(form.lat),
    lng: Number(form.lng)
  })
)
formData.append("date", form.date);
formData.append("type", form.type);
formData.append("lat", Number(form.lat));
formData.append("lng", Number(form.lng));
formData.append("rewardAmount", Number(form.rewardAmount));

  formData.append("image", image);

    const res = await API.post("/items", formData);

    if(res.data.aiMatches && res.data.aiMatches.length){

      setAiMatches(res.data.aiMatches);

    } else {

      navigate("/home");

    }

  } catch (err) {

    console.error(err);
    alert("Something went wrong");

  } finally {

    setLoading(false);

  }
};
  
  const checkMatches = async (title,category,type)=>{

if(!title || !category) return;

try{

const res = await API.get("/items/check-suggestions",{
params:{
title,
category,
type
}
});

if(res.data.found){
setSuggestions(res.data.suggestions);
setShowMatches(true);
}else{
setSuggestions([]);
setShowMatches(false);
}

}catch(err){
console.error("Match error",err);
}

};

  if (isVerifying) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-slate-500 font-medium animate-pulse">Securing session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/home")}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest">New Report</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Step {step} of 3</p>
          </div>
          <div className="w-10" />
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 pt-8">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-indigo-600" : "bg-slate-200"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Visual Proof</h2>
                <p className="text-slate-500 text-sm">Upload a clear photo of the item.</p>
              </div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-dashed border-slate-300 bg-white shadow-sm flex flex-col items-center justify-center group hover:border-indigo-400 transition-all">
                {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-indigo-50 rounded-full text-indigo-600"><Camera size={32} /></div>
                    <span className="text-sm font-medium text-slate-400">Tap to upload</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
                  }} 
                />
              </div>
              <button onClick={() => setStep(2)} disabled={!image} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-all disabled:opacity-50">Continue</button>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex p-1 bg-slate-200/50 rounded-2xl">
                {["lost", "found"].map(t => (
                  <button key={t} onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${form.type === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
                    {t} Item
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Item Title</label>
               <input
placeholder="e.g. iPhone 13 Pro"
className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500/20 outline-none"
value={form.title}
onChange={(e) => {
const value = e.target.value;

setForm({ ...form, title: value });

checkMatches(value, form.category, form.type);
}}
/>
                </div>
                <div className="group">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 mb-1 block">Category</label>
                  <select className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none" value={form.category} onChange={(e) => {

const value = e.target.value;

setForm({ ...form, category: value });

checkMatches(form.title, value, form.type);

}}>
                    <option value="">Select Category</option>
                    <option>Electronics</option><option>Documents</option><option>Bags</option><option>Others</option>
                  </select>
                </div>
{showMatches && suggestions.length > 0 && (

<div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-4 rounded-2xl shadow-sm space-y-4">

{/* HEADER */}

<div className="flex items-center justify-between">

<div className="flex items-center gap-2">

<span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
⚡ Potential Matches
</span>

<span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
AI Engine
</span>

</div>

<button
onClick={()=>setShowMatches(false)}
className="text-[10px] text-slate-400 hover:text-slate-600"
>
Hide
</button>

</div>

{/* LIST */}

<div className="space-y-2">

{suggestions.map((item) => (

<div
key={item._id}
className="flex items-center gap-3 p-3 bg-white rounded-xl border hover:shadow-md hover:border-indigo-200 transition cursor-pointer"
onClick={() => navigate(`/item/${item._id}`, { replace: true })}
>

<div className="relative">

<img
src={item.image}
className="w-12 h-12 rounded-lg object-cover"
/>

{item.rewardAmount > 0 && (
<span className="absolute -top-2 -right-2 text-[9px] bg-yellow-400 text-black px-1.5 py-[2px] rounded font-bold shadow">
₹{item.rewardAmount}
</span>
)}

</div>

<div className="flex-1">

<p className="text-xs font-semibold text-slate-700">
{item.title}
</p>

<p className="text-[10px] text-slate-400 truncate">
{item.location?.address || item.location}
</p>

</div>

{item.aiScore && (
<div className="flex flex-col items-end">

<span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-semibold">
{item.aiScore}% Match
</span>

<span className="text-[9px] text-slate-400">
AI Confidence
</span>

</div>
)}

</div>

))}

</div>

{/* ACTION BUTTONS */}

<div className="pt-3 border-t flex gap-2">

<button
onClick={() => navigate(`/item/${suggestions[0]._id}`)}
className="flex-1 text-xs bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
>
View Match
</button>

<button
onClick={() => setShowMatches(false)}
className="flex-1 text-xs bg-slate-100 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-200"
>
Post Anyway
</button>

</div>

</div>

)}
                {form.type === "lost" && (
                  <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold text-sm"><Coins size={16} /> Reward (Optional)</div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                      <input type="number" className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-3 outline-none" value={form.rewardAmount} onChange={(e) =>
setForm({ ...form, rewardAmount: Number(e.target.value) })
} />
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setStep(3)} disabled={!form.title || !form.category} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold shadow-lg active:scale-95 disabled:opacity-50 transition-all">Next Step</button>
            </motion.div>
          )}

          {aiMatches.length > 0 && (

<div className="bg-purple-50 border border-purple-200 p-4 rounded-xl mb-4">
  <p className="text-xs font-bold text-purple-700 uppercase mb-3">
    🤖 AI Found Similar Items
  </p>

  {aiMatches.map(item => (
    <div
      key={item._id}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:bg-slate-50 cursor-pointer mb-2 transition-all"
      // 🔥 Yahan replace: true add kiya hai
      onClick={() => navigate(`/item/${item._id}`, { replace: true })}
    >
      <img
        src={item.image}
        className="w-12 h-12 rounded object-cover"
        alt={item.title}
      />
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-700">
          {item.title}
        </p>
        <p className="text-xs text-slate-400">
          {item.location?.address}
        </p>
      </div>
      <div className="text-indigo-500 font-bold text-xs uppercase">View →</div>
    </div>
  ))}

  <button
    // 🔥 Yahan bhi replace: true taaki redirect ke baad back button kalesh na kare
    onClick={() => navigate("/home", { replace: true })}
    className="mt-3 w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold shadow-md active:scale-95 transition-transform"
  >
    Post Anyway
  </button>
</div>
)}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input
                    placeholder="Search location (e.g. Jaipur)"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    value={form.location}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                  />
                  {/* SUGGESTIONS LIST */}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden backdrop-blur-xl">
                      {locationSuggestions.map((loc, idx) => (
                        <button key={idx} onClick={() => selectLocation(loc)} className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex items-start gap-3">
                          <MapPin size={14} className="mt-1 text-slate-400" />
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-700 truncate">{loc.display_name.split(',')[0]}</p>
                            <p className="text-[10px] text-slate-400 truncate">{loc.display_name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Calendar className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input type="date" className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500/20 outline-none" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>

                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-slate-400" size={18} />
                  <textarea rows={4} placeholder="Specific details (color, marks)..." className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl flex gap-3 items-start border border-emerald-100">
                <CheckCircle2 className="text-emerald-600 mt-0.5" size={18} />
                <p className="text-xs text-emerald-800 leading-relaxed">Data must be accurate.</p>
              </div>

              <button onClick={handleSubmit} disabled={loading || !form.location} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : "Publish Report"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}