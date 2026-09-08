import { useMemo, useState } from "react";
import { X, ShieldCheck, Fingerprint, History, Package, MapPin, Mail, Award, Ban, CheckCircle, Clock, Tag, FileText, ShieldAlert } from "lucide-react";

export default function UserDossier({ user, items, onClose, onUpdateKarma, onAction }) {
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [activeTicket, setActiveTicket] = useState({ user, items });

  if (!user) return null;

  const sortedItems = useMemo(() => {
    const userItems = items?.filter((i) => i.postedBy?._id === user._id) || [];
    return [...userItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, user._id]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl h-[90vh] md:h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden transition-colors duration-500">
        
        {/* 1️⃣ LEFT PANEL */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          <div className="p-8 text-center border-b border-slate-200 dark:border-slate-800/50">
            <div className="relative inline-block">
              <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}`} className="w-24 h-24 rounded-3xl object-cover mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-xl" alt={user.name}/>
              {user.isVerified && <div className="absolute -top-2 -right-2 p-1.5 bg-blue-500 text-white rounded-full shadow-lg"><ShieldCheck size={16}/></div>}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</h2>
            <p className="text-[10px] text-slate-500 font-bold truncate mt-1">{user.email}</p>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[9px] text-slate-400 uppercase font-black">Reports</p>
                <p className="text-xl font-black dark:text-white">{sortedItems.length}</p>
              </div>
            <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-left">
  <p className="text-[9px] text-slate-400 uppercase font-black text-left">Karma</p>
  <p className="text-xl font-black text-blue-600 dark:text-emerald-400 text-left">
    {activeTicket.user?.karmaPoints || 0} {/* 🔥 FIX: .karmaPoints likho */}
  </p>
</div>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2"><Fingerprint size={14} className="text-blue-500"/> ID Proof</h4>
              {user.idProof ? (
                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-black cursor-pointer" onClick={() => window.open(user.idProof, "_blank")}>
                  <img src={user.idProof} className="w-full h-full object-cover" alt="Proof" />
                </div>
              ) : <div className="py-10 bg-slate-100 dark:bg-slate-800/30 border border-dashed rounded-2xl text-center"><p className="text-[10px] text-slate-400 font-black uppercase">No Record</p></div>}
            </div>
          </div>

          <div className="p-6 bg-slate-100 dark:bg-slate-950/30 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {!user.isVerified ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onAction("approve", user._id)} className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-900/20">Approve</button>
                <button onClick={() => onAction("reject", user._id)} className="py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-white border rounded-xl font-black text-[10px] uppercase">Reject</button>
              </div>
            ) : (
              <button onClick={() => onAction("toggle-ban", user._id)} className="w-full py-3 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 rounded-xl font-black text-[10px] uppercase transition-all tracking-widest">Revoke Access</button>
            )}
          </div>
        </div>

        {/* 2️⃣ RIGHT PANEL: Activity Log */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-blue-500"><History size={18}/></div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Submission Records</h4>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-xl transition-all"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {sortedItems.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {sortedItems.map((item) => (
                  <div key={item._id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-slate-600 transition-all group cursor-pointer" onClick={() => setSelectedPreview(item)}>
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover" alt="" /></div>
                    <div className="flex-1 min-w-0 text-left">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${item.type === 'lost' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>{item.type}</span>
                        <h5 className="text-sm font-black text-slate-800 dark:text-slate-200 truncate uppercase mt-1">{item.title}</h5>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase flex items-center gap-1"><MapPin size={10} className="text-blue-500"/> {item.location?.address?.split(',')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="h-full flex flex-col items-center justify-center opacity-20"><Package size={64}/><p className="text-[10px] font-black uppercase mt-4">Zero Records</p></div>}
          </div>

          {/* 🎯 THE FIXED PREVIEW MODAL (Crystal Clear Layout) */}
          {selectedPreview && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedPreview(null)}></div>
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[95%]">
                
                {/* Close Button Inside Modal */}
                <button onClick={() => setSelectedPreview(null)} className="absolute top-4 right-4 z-[60] p-2 bg-white/20 hover:bg-red-500 text-white rounded-full transition-all backdrop-blur-md"><X size={20}/></button>
                
                {/* 🖼️ Fixed Height Image Container */}
                <div className="w-full h-64 bg-black flex items-center justify-center shrink-0">
                  <img src={selectedPreview.image} className="w-full h-full object-contain" alt="" />
                </div>

                {/* 📜 Scrollable Info Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar text-left flex-1 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${selectedPreview.type === 'lost' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>{selectedPreview.type}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {selectedPreview._id.slice(-8)}</span>
                    <span className="text-[9px] text-blue-500 font-black ml-auto uppercase flex items-center gap-1"><Clock size={12}/> {new Date(selectedPreview.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase mb-8 leading-tight italic tracking-tighter">{selectedPreview.title}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1.5"><MapPin size={12} className="text-blue-500"/> Handover / Location</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedPreview.location?.address || "Classified Location"}</p>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1.5"><Tag size={12} className="text-emerald-500"/> Item Category</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedPreview.category || "General"}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 dark:text-white"><ShieldAlert size={40}/></div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={14}/> Forensic Description</p>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic font-medium">
                      {selectedPreview.description || "No further intelligence provided for this record."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
}