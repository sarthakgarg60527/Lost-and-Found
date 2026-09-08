import { Eye, UserX, Plus, Minus, ShieldCheck, ShieldAlert, Award, CheckCircle } from "lucide-react";

export default function UserManagement({ users, onAction, onUpdateKarma, onSelectUser }) {
  
  const handleSelect = (user) => {
    if (typeof onSelectUser === "function") {
      onSelectUser(user); 
    } else {
      console.warn("onSelectUser function pass nahi kiya gaya hai!");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 rounded-[2rem] border border-slate-200 dark:border-slate-800/50 overflow-hidden shadow-2xl backdrop-blur-md transition-colors duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em] border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-6">Identity & Rank</th>
              <th className="p-6 text-center">Karma Influence</th>
              <th className="p-6 text-center">Verification</th>
              <th className="p-6 text-right">Administrative Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-blue-500/[0.03] dark:hover:bg-blue-500/[0.03] transition-all group">
                
                {/* Profile & Identity Section */}
                <td className="p-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="relative shrink-0">
                      <img 
                        src={u.profileImage || `https://ui-avatars.com/api/?name=${u.name}&background=3b82f6&color=fff`} 
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-blue-500/50 transition-all shadow-lg" 
                        alt={u.name}
                      />
                      {u.isVerified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-white dark:border-[#020617]">
                          <ShieldCheck size={10} className="text-white"/>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 dark:text-slate-200 text-sm truncate uppercase tracking-tight">{u.name}</p>
                        {u.karmaPoints > 500 && <Award size={14} className="text-amber-500" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate lowercase">{u.email}</p>
                    </div>
                  </div>
                </td>

                {/* Karma Control Section */}
                <td className="p-6 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <button 
                      onClick={() => onUpdateKarma && onUpdateKarma(u._id, -50)} 
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-slate-200 dark:border-slate-700/50 active:scale-75"
                    >
                      <Minus size={14}/>
                    </button>
                    
                    <div className="flex flex-col items-center min-w-[50px]">
                      <span className="font-black text-blue-600 dark:text-emerald-400 text-lg tracking-tighter leading-none">
                        {u.karmaPoints}
                      </span>
                      <span className="text-[7px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-widest mt-1">Points</span>
                    </div>
                    
                    <button 
                      onClick={() => onUpdateKarma && onUpdateKarma(u._id, 50)} 
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-emerald-400 hover:bg-blue-50 dark:hover:bg-emerald-500/10 transition-all border border-slate-200 dark:border-slate-700/50 active:scale-75"
                    >
                      <Plus size={14}/>
                    </button>
                  </div>
                </td>

                {/* Security/Verification Status Section */}
                <td className="p-6 text-center">
                  {u.isVerified ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500">
                      <ShieldCheck size={12}/>
                      <span className="text-[9px] font-black uppercase tracking-wider">Trusted</span>
                    </div>
                  ) : u.idProof ? (
                    <div className="inline-flex flex-col items-center gap-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 text-blue-600 dark:text-blue-400 animate-pulse">
                        <ShieldAlert size={12}/>
                        <span className="text-[9px] font-black uppercase tracking-wider">Review Req.</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-tighter italic opacity-60">Pending</span>
                  )}
                </td>

                {/* Administrative Controls Section */}
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-3">
                    {!u.isVerified && u.idProof && (
                      <button 
                        title="Authorize"
                        onClick={() => onAction && onAction("approve", u._id)} 
                        className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                      >
                        <CheckCircle size={18}/>
                      </button>
                    )}

                    <button 
                      title="Dossier"
                      onClick={() => handleSelect(u)} 
                      className="flex items-center gap-2 h-10 px-4 bg-slate-100 dark:bg-blue-600/10 text-slate-700 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-blue-500/20"
                    >
                      <Eye size={16}/> View
                    </button>
                    
                    <button 
                      title="Ban User"
                      onClick={() => onAction && onAction("toggle-ban", u._id)} 
                      className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-500/5 text-red-500 dark:text-red-500/40 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 dark:border-transparent active:scale-90"
                    >
                      <UserX size={18}/>
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}