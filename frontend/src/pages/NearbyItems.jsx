import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  MapPin, LayoutDashboard, User, Trophy, MessageSquare, 
  Plus, LogOut, Package, HelpCircle
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Ensure CSS is imported

export default function NearbyItems() {
  const [items, setItems] = useState([]);
  const [userLocation, setUserLocation] = useState([26.9124, 75.7873]); // Default Jaipur
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async (lat, lng) => {
      try {
        const res = await API.get("/items/nearby", { params: { lat, lng } });
        setItems(res.data.items);
      } catch (err) {
        console.error("Fetch nearby failed", err);
      } finally {
        setLoading(false);
      }
    };

    // Geolocation with faster fallback
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          fetchData(latitude, longitude);
        },
        () => {
          fetchData(26.9124, 75.7873); // Fallback if denied
        },
        { timeout: 5000 } // 5 seconds timeout for geo
      );
    } else {
      fetchData(26.9124, 75.7873);
    }
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#F6F7FB] text-slate-800 font-sans overflow-hidden">
      
      {/* ⬇️ SIDEBAR (Always Visible - No Blink) ⬇️ */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col bg-white border-r shrink-0">
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
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button onClick={() => navigate("/home")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600"><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => navigate("/profile")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600"><User size={18} /> Profile</button>
          <button onClick={() => navigate("/leaderboard")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600"><Trophy size={18} /> Leaderboard</button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-medium w-full transition-all"><MapPin size={18} /> Nearby Items</button>
          <button onClick={() => navigate("/inbox")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600"><MessageSquare size={18} /> Messages</button>
          <button onClick={() => navigate("/create")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full font-medium transition-all text-slate-600"><Plus size={18} /> Report Item</button>
        </nav>
        <div className="p-4 border-t space-y-1">
          <button onClick={() => navigate("/help")} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 w-full text-slate-600 transition-all"><HelpCircle size={18} /> Help & Support</button>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-all font-medium"><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b px-8 py-6 h-[89px] flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div>
            <h2 className="text-xl font-bold">Nearby Reports</h2>
            <p className="text-xs text-slate-400">Intelligence based on your GPS signal</p>
          </div>
        </header>

        <main className="p-8 w-full space-y-8">
          {loading ? (
            /* ✅ SKELETON LOADING (Industrial SaaS Feel) */
            <div className="space-y-8 animate-pulse">
              <div className="h-80 w-full bg-slate-200 rounded-2xl shadow-sm" />
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-white rounded-2xl border" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* MAP SECTION */}
              <div className="h-96 w-full rounded-3xl overflow-hidden shadow-sm border-4 border-white relative z-10">
                <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={userLocation}>
                    <Popup>Your Location</Popup>
                  </Marker>
                  {items.map((item) => (
                    <Marker key={item._id} position={[item.location.coordinates[1], item.location.coordinates[0]]}>
                      <Popup>
                        <div className="cursor-pointer p-1" onClick={() => navigate(`/item/${item._id}`)}>
                          <p className="font-bold text-sm">{item.title}</p>
                          <p className="text-[10px] text-slate-500">{item.location.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* GRID SECTION */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border">
                        <MapPin size={40} className="mx-auto text-slate-200 mb-2"/>
                        <p className="text-slate-400 font-medium">No items reported nearby yet.</p>
                    </div>
                ) : items.map((item) => (
                  <div key={item._id} onClick={() => navigate(`/item/${item._id}`)} className="bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer overflow-hidden group">
                    <div className="h-44 w-full overflow-hidden relative">
                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                            {item.type}
                        </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-slate-800 truncate">{item.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2 font-medium">
                        <MapPin size={14} className="text-blue-500" /> {item.location.address.split(',')[0]}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        {item.rewardAmount > 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg font-bold border border-yellow-200">
                            ₹{item.rewardAmount}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Details →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}