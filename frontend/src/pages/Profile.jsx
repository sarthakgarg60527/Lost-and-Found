  import { useState, useEffect, useRef } from "react";
  import API from "../services/api";
  import { useNavigate } from "react-router-dom";
  import { motion, animate } from "framer-motion";
  import {
    Mail, User, LayoutDashboard, MessageSquare, Plus, 
    Trophy, MapPin, CheckCircle2, Edit3, Save, LogOut, 
    Package, Camera, ShieldCheck, Clock, Globe, Calendar,
    Star, Zap, TrendingUp, Heart , HelpCircle
  } from "lucide-react";

  export default function Profile() {
    const navigate = useNavigate();
    const karmaRef = useRef();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", bio: "", address: "" });
    const [profilePreview, setProfilePreview] = useState(null);
    const [idFile, setIdFile] = useState(null);
    const [idPreview, setIdPreview] = useState(null);

    useEffect(() => { fetchUser(); }, []);

    const fetchUser = async () => {
      try {
        const res = await API.get("/users/profile");
        setUserData(res.data);
        setFormData({
          name: res.data.name || "",
          bio: res.data.bio || "",
          address: res.data.address || ""
        });
        if (res.data.profileImage) setProfilePreview(res.data.profileImage);

        // Karma Counter Animation
        const karmaValue = res.data.karmaPoints || 0;
        const controls = animate(0, karmaValue, {
          duration: 2,
          onUpdate(v) {
            if (karmaRef.current) karmaRef.current.textContent = Math.floor(v);
          }
        });
        return () => controls.stop();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const getRank = (p) => {
      if (p >= 500) return { label: "Legend", icon: <Trophy size={20}/>, color: "text-yellow-500", next: 1000 };
      if (p >= 200) return { label: "Pro", icon: <Star size={20}/>, color: "text-blue-500", next: 500 };
      if (p >= 50) return { label: "Active", icon: <ShieldCheck size={20}/>, color: "text-green-500", next: 200 };
      return { label: "Newbie", icon: <Zap size={20}/>, color: "text-slate-400", next: 50 };
    };

    const handleIdUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
    };

    const submitVerification = async () => {
      if (!idFile) return;
      try {
        const data = new FormData();
        data.append("image", idFile);
        await API.post("/users/verify-request", data, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Verification Request Sent!");
        setIdPreview(null);
        setIdFile(null);
        fetchUser();
      } catch (err) { alert("Upload fail!"); }
    };

    const handleImageChange = async(e)=>{
      const file = e.target.files[0];
      if(!file) return;
      setProfilePreview(URL.createObjectURL(file));
      try{
        const data = new FormData();
        data.append("profilePhoto",file);
        await API.post("/users/profile-photo",data,{ headers:{ "Content-Type":"multipart/form-data"} });
        fetchUser();
      }catch(err){ console.error(err); }
    };

    const handleUpdate = async ()=>{
      try {
          await API.put("/users/profile", formData);
          setIsEditing(false);
          fetchUser();
      } catch (err) { console.error(err); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });

    const status = userData?.verificationStatus;
    const isApproved = userData?.isVerified === true || status === "approved";
    const isPending = status === "pending" && !userData?.isVerified;
    
    const currentKarma = userData?.karmaPoints || 0;
    const rank = getRank(currentKarma);
    const progress = (currentKarma / rank.next) * 100;


    return (
      <div className="flex min-h-screen bg-white text-slate-900 font-sans">
      {/* SIDEBAR */}
        <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col bg-white border-r">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow">
                <Package size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold">FoundIt</h1>
                <p className="text-xs text-slate-400">Lost & Found Network</p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Dashboard - Ab ye normal dikhega */}
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-600 font-medium w-full transition-all"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            {/* Profile - Ab ye BLUE (Active) dikhega */}
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold w-full transition-all"
            >
              <User size={18} />
              Profile
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-600 font-medium w-full"
            >
              <Trophy size={18} />
              Leaderboard
            </button>
            
            <button
              onClick={() => navigate("/nearby")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-600 font-medium w-full"
            >
              <MapPin size={18} />
              Nearby Items
            </button>

            <button
              onClick={() => navigate("/inbox")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-600 font-medium w-full"
            >
              <MessageSquare size={18} />
              Messages
            </button>

            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-600 font-medium w-full"
            >
              <Plus size={18} />
              Report Item
            </button>
          </nav>

          {/* HELP & LOGOUT (Sticky at bottom) */}
          <div className="p-4 border-t space-y-1">
            <button
              onClick={() => navigate("/help")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full text-slate-600 font-medium"
            >
              <HelpCircle size={18} />
              Help & Support
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full font-bold"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>


       <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          
         {/* 2. HEADER: Isko bhi loading se bahar rakh */}
       
     <main className="p-10 w-full">
          {loading ? (
            /* Leaderboard style Skeleton blocks yahan aayenge */
            <div className="space-y-10 animate-pulse">
               <div className="bg-white rounded-3xl h-48 w-full border" />
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 h-96 bg-white rounded-3xl border shadow-sm" />
                  <div className="space-y-8">
                     <div className="bg-white rounded-[2.5rem] h-64 border shadow-sm" />
                     <div className="bg-white rounded-[2.5rem] h-32 border shadow-sm" />
                  </div>
               </div>
            </div>
        ) : (
          <div className="p-10 max-w-full mx-auto space-y-10">
            
            {/* HEADER SECTION */}
            <section className="flex flex-col md:flex-row gap-10 items-center md:items-start border-b pb-10">
              <div className="relative group">
                <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100">
                  <img src={profilePreview || `https://ui-avatars.com/api/?name=${userData.name}&background=random`} className="w-full h-full object-cover" />
                </div>
                <label className="absolute -bottom-3 -right-3 p-3 bg-blue-600 text-white rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition-transform">
                  <Camera size={20} /><input type="file" className="hidden" onChange={handleImageChange}/>
                </label>
              </div>

             <div className="flex-1 pt-2">
  {isEditing ? (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div className="col-span-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
          <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold focus:border-blue-500" value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})}/>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bio</label>
          <input className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" value={formData.bio} onChange={(e)=>setFormData({...formData,bio:e.target.value})}/>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Address</label>
          <input className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500" value={formData.address} onChange={(e)=>setFormData({...formData,address:e.target.value})}/>
        </div>
      </div>
      {/* Save & Cancel Buttons */}
      <div className="flex gap-3 pt-2">
        <button onClick={handleUpdate} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
          <Save size={14} /> Save Changes
        </button>
        <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div className="space-y-6 text-center md:text-left">
      <div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-1">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">{userData.name}</h1>
            {isApproved && <CheckCircle2 className="text-blue-500" size={24} />}
          </div>
          
          {/* 🔥 YE RAHA EDIT BUTTON */}
          <button 
            onClick={() => setIsEditing(true)} 
            className="flex items-center justify-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full border border-slate-100 transition-all w-fit mx-auto md:mx-0"
          >
            <Edit3 size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Edit Profile</span>
          </button>
        </div>
        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl">{userData.bio || "No biography added yet."}</p>
      </div>
      
      <div className="flex flex-wrap justify-center md:justify-start gap-8">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm truncate"><Mail size={16} className="text-slate-300" /> {userData.email}</div>
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm"><Globe size={16} className="text-slate-300" /> {userData.address || "Global"}</div>
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm"><Calendar size={16} className="text-slate-300" /> Joined {formatDate(userData.createdAt)}</div>
      </div>
    </div>
  )}
</div>
            </section>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* LEFT COLUMN: ACTIVITY */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tighter uppercase">Recent Activity</h3>
                  <button onClick={() => navigate("/create")} className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"><Plus size={14}/> New Report</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userData.posts?.length > 0 ? (
                    userData.posts.map(post => (
                      <div key={post._id} onClick={() => navigate(`/item/${post._id}`)} className="group p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all cursor-pointer flex gap-4 items-center">
                        <img src={post.image} className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 truncate">{post.title}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{post.status || "reported"}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                      <Package size={40} className="mb-4 opacity-20" /><p className="font-bold tracking-tight">No items reported yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: KARMA & IDENTITY */}
              <div className="space-y-8">
                
                {/* 1. KARMA SCORE CARD */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6 relative overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg">Karma Score</h3>
                    <div className={`p-3 rounded-2xl bg-slate-50 ${rank.color}`}>{rank.icon}</div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-baseline gap-2">
                      <p ref={karmaRef} className="text-5xl font-black text-slate-900">0</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Points</p>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-600" />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Rank: {rank.label}</p>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{rank.next - currentKarma} to go</p>
                      </div>
                    </div>
                  </div>
                  <TrendingUp size={120} className="absolute -bottom-8 -right-8 text-slate-50 -rotate-12 opacity-50" />
                </div>

                {/* 2. STATS GRID (Old Stats UI match) */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Engagement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-5 rounded-3xl text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Items Found</p>
                      <p className="text-2xl font-black text-slate-800">{userData?.itemsFound || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-3xl text-center border-2 border-blue-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Trust Rate</p>
                      <p className="text-2xl font-black text-blue-600">98%</p>
                    </div>
                  </div>
                </div>


                {/* 4. IDENTITY STATUS */}
                <div className={`p-8 rounded-[2.5rem] border transition-all ${isApproved ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex flex-col items-center text-center gap-4">
                    {isApproved ? (
                      <>
                        <div className="p-4 bg-green-500 text-white rounded-full shadow-lg"><ShieldCheck size={32} /></div>
                        <h4 className="font-black text-green-700 uppercase text-xs tracking-widest">Verified Account</h4>
                      </>
                    ) : isPending ? (
                      <>
                        <div className="p-4 bg-amber-500 text-white rounded-full shadow-lg animate-pulse"><Clock size={32} /></div>
                        <h4 className="font-black text-amber-700 uppercase text-xs tracking-widest">Status: Pending</h4>
                      </>
                    ) : (
                      <div className="space-y-5 w-full">
                        <div className="p-4 bg-slate-200 text-slate-400 rounded-full inline-block mx-auto"><ShieldCheck size={32} /></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unverified Profile</p>
                        <label className="block w-full bg-slate-900 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-black text-center transition-all shadow-md">
                          Upload ID proof
                          <input type="file" className="hidden" onChange={handleIdUpload}/>
                        </label>
                        {idPreview && (
                          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <img src={idPreview} className="w-full h-36 rounded-2xl object-cover border-2 border-white bg-white shadow-sm mb-3" />
                            <button onClick={submitVerification} className="w-full bg-blue-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200">Submit to Admin</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
        </main>
        </div>
      </div>
    );
  }