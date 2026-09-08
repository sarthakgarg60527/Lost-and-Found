import { useEffect, useState, useRef } from "react"
import { 
    Bell, CheckCircle, Sparkles, Package, 
    ShieldCheck, Gift, MessageSquare, AlertCircle, Trash2 
} from "lucide-react"
import API from "../services/api"
import { useNavigate } from "react-router-dom"

export default function Notification() {
    const [notifications, setNotifications] = useState([])
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef()
    const navigate = useNavigate()

    // 1. Icon Selector Logic (Based on Backend 'type')
    const renderIcon = (n) => {
        if (n.sender && n.sender.profileImage) {
            return (
                <img 
                    src={n.sender.profileImage} 
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200" 
                    alt="sender"
                />
            )
        }

        const iconSize = 18;
        const iconClass = !n.read ? "text-blue-600" : "text-slate-500";
        
        switch (n.type) {
            case "handover": return <Package size={iconSize} className={iconClass} />;
            case "verification": return <ShieldCheck size={iconSize} className={iconClass} />;
            case "reward": return <Gift size={iconSize} className={iconClass} />;
            case "message": return <MessageSquare size={iconSize} className={iconClass} />;
            case "match": return <Sparkles size={iconSize} className={iconClass} />;
            default: return <Bell size={iconSize} className={iconClass} />;
        }
    }

    // FETCH NOTIFICATIONS
    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications")
            setNotifications(res.data)
        } catch (err) {
            console.log("Error fetching notifications:", err)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 8000) // 8 sec auto-refresh
        return () => clearInterval(interval)
    }, [])

    // OUTSIDE CLICK HANDLER
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    // HANDLE CLICK (READ & NAVIGATE)
    const handleNotificationClick = async (n) => {
        if (!n.read) {
            try {
                await API.put(`/notifications/read/${n._id}`)
                setNotifications(prev =>
                    prev.map(x => x._id === n._id ? { ...x, read: true } : x)
                )
            } catch (err) {
                console.log("Error marking as read", err)
            }
        }

        setOpen(false)

        // Smart Redirection Logic
        if (n.link) {
            navigate(n.link)
        } else if (n.item) {
            const itemId = typeof n.item === 'object' ? n.item._id : n.item;
            navigate(`/item/${itemId}`)
        } else {
            navigate("/dashboard")
        }
    }

    // MARK ALL READ
    const markAll = async () => {
        try {
            await API.put("/notifications/read-all")
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        } catch (err) {
            console.log("Error marking all read", err)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* BELL BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition focus:outline-none"
            >
                <Bell size={22} className={unreadCount > 0 ? "text-blue-600" : "text-slate-700"} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-[2px] rounded-full shadow-lg border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN */}
            {open && (
                <div className="absolute right-0 mt-4 w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                    
                    {/* HEADER */}
                    <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-blue-600" />
                            <h3 className="font-bold text-slate-800">Notifications</h3>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAll}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* LIST */}
                    <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-sm">
                                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`flex gap-4 px-6 py-4 border-b transition cursor-pointer hover:bg-slate-50 relative
                                        ${!n.read ? "bg-blue-50/40" : ""}
                                    `}
                                >
                                    {/* ICON / SENDER IMAGE */}
                                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center
                                        ${!n.read ? "bg-blue-100 shadow-sm" : "bg-slate-100"}
                                    `}>
                                        {renderIcon(n)}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className={`text-sm leading-tight ${!n.read ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                                                {n.title}
                                            </p>
                                            {!n.read && (
                                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 shadow-sm" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-2">
                                            {new Date(n.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="bg-slate-50 py-3 text-center border-t">
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            FoundIt Notification Protocol
                         </p>
                    </div>
                </div>
            )}
        </div>
    )
}