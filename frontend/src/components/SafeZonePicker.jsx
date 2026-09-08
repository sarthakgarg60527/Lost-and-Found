import React, { useState } from "react";
import { MapPin, ShieldCheck, Loader2, Navigation, Sparkles } from "lucide-react";
import axios from "axios";

export default function SafeZonePicker({ onSelectLocation }) {

  const [loading,setLoading] = useState(false);
  const [zones,setZones] = useState([]);
  const [error,setError] = useState(null);

  const fetchSafeZones = async (lat,lon)=>{

    setLoading(true);
    setError(null);

    try{

      const res = await axios.get(
        `http://localhost:5000/api/safe-zones?lat=${lat}&lng=${lon}`
      );

      if(res.data && res.data.length>0){

        const results = res.data.map(zone=>({

          id:zone._id,
          name:zone.name,
          type:zone.type,
          lat:zone.location.coordinates[1],
          lon:zone.location.coordinates[0]

        }));

        setZones(results);

      }else{

        setError("No verified safe zones found nearby.");

      }

    }catch(err){

      console.error("DB Fetch Error:",err);

      setError("Unable to connect to safe zone database.");

    }finally{

      setLoading(false);

    }

  };

  const getMyLocation = ()=>{

    if(!navigator.geolocation){

      setError("Geolocation not supported");

      return;

    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(

      (pos)=>{

        fetchSafeZones(pos.coords.latitude,pos.coords.longitude);

      },

      ()=>{

        setLoading(false);

        setError("Location permission denied.");

      }

    );

  };

  return(

    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-[360px] max-h-[420px] flex flex-col">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-5">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Sparkles size={18}/>
          </div>

          <div>

            <h3 className="text-sm font-semibold text-slate-800">
              Safe Zones
            </h3>

            <p className="text-[10px] text-slate-400">
              FoundIt Verified Locations
            </p>

          </div>

        </div>

        <button
          onClick={getMyLocation}
          disabled={loading}
          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
        >

          {loading
            ? <Loader2 className="animate-spin" size={18}/>
            : <Navigation size={18}/>
          }

        </button>

      </div>

      {/* ZONE LIST */}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">

        {zones.length>0 ? (

          zones.map(zone=>(

            <button
              key={zone.id}
              onClick={()=>onSelectLocation(zone)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-white border border-transparent hover:border-emerald-200 hover:shadow-md transition text-left"
            >

              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-emerald-500 border">

                <ShieldCheck size={18}/>

              </div>

              <div className="flex-1">

                <p className="text-sm font-medium text-slate-800 truncate">
                  {zone.name}
                </p>

                <p className="text-[11px] text-slate-400">
                  {zone.type}
                </p>

              </div>

            </button>

          ))

        ) : (

          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">

            <MapPin size={26} className="mx-auto text-slate-300 mb-2"/>

            <p className="text-xs text-slate-400">
              Click navigation to scan nearby safe zones
            </p>

            {error && (

              <p className="text-xs text-red-500 mt-2">
                {error}
              </p>

            )}

          </div>

        )}

      </div>

      {/* FOOTER */}

      {loading && (

        <p className="text-center text-[11px] text-blue-500 mt-3 animate-pulse">

          Searching nearby verified zones...

        </p>

      )}

    </div>

  );

}