import { useState, useMemo } from "react";
import { Trash2, MapPin, X, Clock, Tag, FileText, ShieldAlert, CheckCircle, UserCheck, Banknote, Eye } from "lucide-react";

export default function ItemInventory({ items, onDelete, onSelectUser }) {
  const [selectedItem, setSelectedItem] = useState(null);

  // 🛡️ Data Sync optimization
  const memoizedItems = useMemo(() => items, [items]);

  // ItemInventory.jsx ke andar handleUserClick function ko aisa kar do:
const handleUserClick = (user) => {
  if (user && onSelectUser) {
    setSelectedItem(null); // Pehle item modal band karo
    onSelectUser(user);    // Fir user dossier kholo
  }
};

  return (
    <div className="relative">
      {/* 📋 Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {memoizedItems.map(item => (
          <div 
            key={item._id} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 hover:border-blue-400 dark:hover:border-slate-600 transition-all flex flex-col group cursor-pointer shadow-xl hover:shadow-2xl"
            onClick={() => setSelectedItem(item)}
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/50">
              <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title}/>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest bg-blue-600 px-4 py-2 rounded-full shadow-2xl">Inspect Record</span>
              </div>
              <div className="absolute top-3 left-3 flex flex-col gap-2 text-left">
                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${item.type === 'lost' ? 'bg-red-500 text-white border-red-400' : 'bg-emerald-500 text-white border-emerald-400'} shadow-lg`}>
                  {item.type}
                </div>
                {item.status === 'returned' && (
                  <div className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-900 text-emerald-400 border border-emerald-500/30 shadow-lg flex items-center gap-1">
                    <CheckCircle size={10}/> Returned
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3 px-1 text-left">
              <h3 className="font-black text-slate-900 dark:text-slate-100 truncate text-lg tracking-tight uppercase group-hover:text-blue-500 transition-colors">{item.title}</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-tighter">
                <MapPin size={12} className="text-blue-500"/><span className="truncate">{item.location?.address || "Unknown Location"}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-blue-500 uppercase">
                    {item.postedBy?.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{item.postedBy?.name || "Unknown"}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(item._id); }} className="p-2 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-90"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔍 ELITE DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 bg-slate-900/60 dark:bg-[#020617]/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-full max-h-[85vh]">
            
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-20 p-3 bg-slate-100 dark:bg-white/5 hover:bg-red-500 hover:text-white text-slate-600 dark:text-white rounded-2xl transition-all border border-slate-200 dark:border-white/10"><X size={20}/></button>
            
            <div className="w-full md:w-1/2 relative bg-slate-50 dark:bg-black flex items-center justify-center border-r border-slate-200 dark:border-white/5 text-left">
              <img src={selectedItem.image} className="w-full h-full object-contain" alt="" />
              <div className="absolute bottom-6 left-6 text-left">
                 <span className="px-3 py-1 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-lg text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Evidence File</span>
              </div>
            </div>

            <div className="p-10 flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-[#0a0f1e]">
              <div className="space-y-1 mb-6 text-left">
                <div className="flex items-center gap-2">
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${selectedItem.type === 'lost' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>Report: {selectedItem.type}</span>
                   <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded text-[8px] font-black uppercase tracking-widest italic">ID: {selectedItem._id.slice(-8)}</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase italic">{selectedItem.title}</h2>
              </div>

              <div className="space-y-6 text-left">
                {/* 🤝 HANDOVER LOGISTICS */}
                <div className="p-6 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-[2rem] space-y-4">
                  <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2"><ShieldAlert size={14}/> Handover Logistics</h4>
                  
                  {selectedItem.status === 'returned' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-emerald-500"><UserCheck size={20}/></div>
                        <div className="text-left text-left">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Received By</p>
                          <div className="flex items-center gap-2 group/user">
                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase truncate max-w-[120px]">
                                {selectedItem.handoverTo?.name || (typeof selectedItem.handoverTo === 'string' ? selectedItem.handoverTo : "Verified Owner")}
                            </p>
                            {/* 🔥 DOSSIER BUTTON: Receiver ki profile dekhne ke liye */}
                            {selectedItem.handoverTo?._id && (
                                <button 
                                  onClick={() => handleUserClick(selectedItem.handoverTo)}
                                  className="p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                  title="View Recipient Dossier"
                                >
                                  <Eye size={12}/>
                                </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-blue-500"><Clock size={20}/></div>
                        <div className="text-left text-left">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Closing Date</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white uppercase">
                            {selectedItem.handoverDate ? new Date(selectedItem.handoverDate).toLocaleDateString() : new Date(selectedItem.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:col-span-2 border-t dark:border-slate-800 pt-3 text-left">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-amber-500"><Banknote size={20}/></div>
                        <div className="text-left">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Reward Settlement</p>
                          <p className="text-sm font-black text-slate-800 dark:text-white uppercase">
                            {selectedItem.rewardAmount > 0 ? `₹${selectedItem.rewardAmount} - ${selectedItem.escrowStatus}` : "No Reward Claimed"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center"><p className="text-xs font-bold text-slate-400 uppercase italic tracking-widest">Awaiting Digital Handover Protocol...</p></div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                   <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><MapPin size={12} className="text-blue-500"/> Location</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedItem.location?.address || "Classified"}</p>
                   </div>
                   <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Tag size={12} className="text-emerald-500"/> Category</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedItem.category}</p>
                   </div>
                </div>

                <div className="space-y-2 text-left">
                   <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-2"><FileText size={14} className="text-blue-500"/> Intelligence Report</h4>
                   <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic font-medium">{selectedItem.description || "No further intelligence provided."}</p>
                   </div>
                </div>

                {/* Reporter & Actions Footer */}
                <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-blue-600 flex items-center justify-center font-black text-lg text-white shadow-lg uppercase">{selectedItem.postedBy?.name?.charAt(0) || "U"}</div>
                    <div className="text-left text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Reporter: {selectedItem.postedBy?.name || "System"}</p>
                        {/* 🔥 Reporter ki profile dekhne ke liye button */}
                        <button 
                          onClick={() => handleUserClick(selectedItem.postedBy)} 
                          className="p-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                          title="View Reporter Dossier"
                        >
                           <Eye size={12}/>
                        </button>
                      </div>
                      <p className="text-[9px] text-blue-600 font-black uppercase mt-1 flex items-center gap-1"><Clock size={10}/> Filed: {new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => { onDelete(selectedItem._id); setSelectedItem(null); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95"><Trash2 size={14}/> Wipe From Database</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
}