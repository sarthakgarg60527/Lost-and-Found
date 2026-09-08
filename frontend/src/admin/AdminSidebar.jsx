import { useEffect, useRef } from "react";
import { LayoutDashboard, Users, Package, HelpCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar({ activeTab, setActiveTab, isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🚨 LOOP PREVENTER: State initialization guard
  const isInitialized = useRef(false);

  // 🔄 1. SYNC STATE WITH URL & LOCALSTORAGE
  useEffect(() => {
    if (!isInitialized.current) {
      const savedTab = localStorage.getItem("admin_active_tab");
      const currentPath = location.pathname;

      if (currentPath === "/admin/dashboard" || currentPath.includes("/admin")) {
        if (savedTab && savedTab !== activeTab) {
          setActiveTab(savedTab);
        }
      }
      isInitialized.current = true; 
    }
  }, [location.pathname, activeTab, setActiveTab]);

  // 🚀 2. TAB CHANGE HANDLER
  const handleTabChange = (tabId) => {
    if (activeTab === tabId) return; 
    
    setActiveTab(tabId);
    localStorage.setItem("admin_active_tab", tabId);
    
    if (location.pathname !== "/admin/dashboard") {
      navigate("/admin/dashboard");
    }
  };

  const handleLogout = () => {

  if (
    window.confirm(
      "Terminate Admin Session?"
    )
  ) {

    localStorage.removeItem(
      "admin_active_tab"
    );

    localStorage.removeItem(
      "admin_token"
    );

    localStorage.removeItem(
      "admin_data"
    );

    navigate("/admin/login");
  }
};

  // Support mode mein sidebar hide logic (Tera existing)
  if (activeTab === "help") return null;

  const mainItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20}/> },
    { id: "users", label: "Users", icon: <Users size={20}/> },
    { id: "items", label: "Inventory", icon: <Package size={20}/> },
  ];

  return (
    <aside className={`
      ${isOpen ? "w-72" : "w-24"} 
      transition-all duration-300 ease-in-out 
      border-r border-slate-200 dark:border-slate-800 
      bg-white dark:bg-[#020617] 
      flex flex-col h-screen sticky top-0 z-50 overflow-hidden
    `}>
      
      {/* 🧩 LOGO SECTION */}
      <div className="p-8 mb-4 flex items-center justify-start overflow-hidden">
        <div className="shrink-0 w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/40">
          <span className="text-white font-black text-xl">F</span>
        </div>
        {isOpen && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-4 font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase italic whitespace-nowrap"
          >
            Commander
          </motion.span>
        )}
      </div>

      {/* 🚀 NAVIGATION BUTTONS */}
      <nav className="flex-1 px-4 space-y-2">
        {mainItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`
              w-full flex items-center ${isOpen ? "px-5" : "justify-center"} py-4 rounded-2xl transition-all relative group 
              ${activeTab === item.id 
                ? "bg-red-600 text-white shadow-xl shadow-red-900/20" 
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
              }
            `}
          >
            <div className="shrink-0">{item.icon}</div>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-4 text-xs font-black uppercase tracking-widest whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
            
            {/* Tooltip for collapsed mode */}
            {!isOpen && (
               <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] border border-slate-700 uppercase tracking-widest">
                  {item.label}
               </div>
            )}
          </button>
        ))}
      </nav>

      {/* 🛠️ UTILITIES (Bottom) */}
      <div className="p-4 space-y-2 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={() => handleTabChange("help")}
          className={`
            w-full flex items-center ${isOpen ? "px-5" : "justify-center"} py-4 rounded-2xl transition-all group 
            ${activeTab === "help" 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
              : "text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-500/5 hover:text-blue-600 dark:hover:text-blue-400"
            }
          `}
        >
          <div className="shrink-0"><HelpCircle size={20}/></div>
          {isOpen && <span className="ml-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">Support Intel</span>}
        </button>

        <button 
          onClick={handleLogout}
          className={`
            w-full flex items-center ${isOpen ? "px-5" : "justify-center"} py-4 text-slate-500 hover:text-red-500 
            hover:bg-red-50 dark:hover:bg-red-500/5 rounded-2xl transition-all group
          `}
        >
          <div className="shrink-0"><LogOut size={20}/></div>
          {isOpen && <span className="ml-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">Terminate</span>}
        </button>
      </div>
    </aside>
  );
}