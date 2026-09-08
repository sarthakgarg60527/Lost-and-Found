import { useEffect, useState ,useCallback,useMemo} from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import Notification from "../components/Notification";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Plus,
  LogOut,
  Package,
  LayoutDashboard,
  MessageSquare,
  Trophy,
  TrendingUp,
  User,
  MapPin,
  HelpCircle,
} from "lucide-react";

import ItemCard from "../components/ItemCard";
import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true,
});

export default function Home() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
const userData = useMemo(() => {

  try {

    const storedUser =
      localStorage.getItem(
        "user_data"
      );

    return storedUser
      ? JSON.parse(storedUser)
      : null;

  } catch (error) {

    console.error(
      "User parse error:",
      error
    );

    localStorage.removeItem(
      "user_data"
    );

    return null;
  }

}, []);

  useEffect(() => {

  if (!userData) {
    navigate("/login");
    return;
  }
if (userData.role === "admin") {

  navigate("/admin/dashboard");

  return;
}

}, [userData, navigate]);

// 📄 3. FETCH FUNCTION
  const fetchItems =useCallback(async () => {
    try {
      const res = await API.get("/items");
      setItems(res.data);
    } catch (err) {
      console.error("🔴 Home Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const userInitials =
userData?.name
? userData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
: "?";
useEffect(() => {

  if (
    !userData ||
    userData.role === "admin"
  ) return;

  fetchItems();

  const userId =
    userData._id || userData.id;

  if (userId) {
    socket.emit(
      "join_chat",
      userId
    );
  }

  socket.off(
    "new_item_posted"
  );

  socket.off(
    "receive_message"
  );

  socket.on(
    "new_item_posted",
    (newItem) => {

      setItems((prev) => [
        newItem,
        ...prev
      ]);
    }
  );

  socket.on(
    "receive_message",
    () => {

      setUnreadCount(
        (prev) => prev + 1
      );
    }
  );

  return () => {

    socket.off(
      "receive_message"
    );

    socket.off(
      "new_item_posted"
    );
  };

}, [fetchItems, userData]);
  
const handleLogout = () => {

  localStorage.removeItem(
    "user_token"
  );

  localStorage.removeItem(
    "user_data"
  );

  window.location.href =
    "/login";
};
  const filteredItems = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());

    if (filter === "all") return matchSearch;
    if (filter === "returned") return matchSearch && item.status === "returned";

    return matchSearch && item.type === filter;
  });

  const activeReports = items.filter((i) => i.status !== "returned").length;
  const returnedCount = items.filter((i) => i.status === "returned").length;

  const successRate =
    items.length > 0 ? Math.round((returnedCount / items.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#F6F7FB] text-slate-800">
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
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium w-full"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full"
          >
            <User size={18} />
            Profile
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full"
          >
            <Trophy size={18} />
            Leaderboard
          </button>
          
          <button
            onClick={() => navigate("/nearby")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full"
          >
            <MapPin size={18} />
            Nearby Items
          </button>

          <button
            onClick={() => navigate("/inbox")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full"
          >
            <MessageSquare size={18} />
            Messages
          </button>

          <button
            onClick={() => navigate("/create")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full"
          >
            <Plus size={18} />
            Report Item
          </button>
        </nav>

        {/* HELP & LOGOUT (Sticky at bottom) */}
        <div className="p-4 border-t space-y-1">
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full text-slate-600"
          >
            <HelpCircle size={18} />
            Help & Support
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-8 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Lost & Found Feed</h2>
            <p className="text-sm text-slate-400">Community Reports</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lost items..."
                className="pl-9 pr-3 py-2.5 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Notification />

            <button
              onClick={() => navigate("/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Report
            </button>

            <div
              onClick={() => navigate("/profile")}
              className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm cursor-pointer"
            >
              {userInitials}
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm flex justify-between">
              <div>
                <p className="text-sm text-slate-400">Recovery Rate</p>
                <h2 className="text-3xl font-bold text-blue-600">{successRate}%</h2>
              </div>
              <TrendingUp className="text-blue-600" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm flex justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Reports</p>
                <h2 className="text-3xl font-bold">{activeReports}</h2>
              </div>
              <Package className="text-orange-500" />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm flex justify-between">
              <div>
                <p className="text-sm text-slate-400">Returned Items</p>
                <h2 className="text-3xl font-bold text-green-600">{returnedCount}</h2>
              </div>
              <Trophy className="text-green-600" />
            </div>
          </div>

          <div className="flex gap-3">
            {["all", "lost", "found", "returned"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 text-sm rounded-full border transition-all ${
                  filter === t
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white hover:bg-slate-100"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-6">Recent Reports</h3>

            {loading ? (
              <p className="text-center py-10">Loading intelligence...</p>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package size={40} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-semibold">No items found</h3>
                <p className="text-sm text-slate-400">Try adjusting your search or filter.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      layout
                    >
                      <ItemCard item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}