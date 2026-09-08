import { motion } from "framer-motion";
import {
  Sparkles,
  Megaphone,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopWidgets({ suggestions = [] }) {

  const navigate = useNavigate();

  return (

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

      {/* AI MATCHES */}

      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between"
      >

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">

            <Sparkles size={16} className="text-blue-600"/>

            <h3 className="text-sm font-semibold text-slate-700">
              AI Matches
            </h3>

          </div>

          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">
            Live
          </span>

        </div>


        {suggestions.length > 0 ? (

          <div
            onClick={()=>navigate(`/item/${suggestions[0]._id}`)}
            className="flex items-center gap-3 cursor-pointer group"
          >

            <img
              src={suggestions[0].image}
              className="w-12 h-12 rounded-lg object-cover"
              alt=""
            />

            <div className="flex-1 min-w-0">

              <p className="text-sm font-semibold text-slate-800 truncate">
                {suggestions[0].title}
              </p>

              <p className="text-xs text-blue-500">
                Possible match detected
              </p>

            </div>

            <ArrowRight
              size={16}
              className="text-slate-300 group-hover:text-blue-600 transition"
            />

          </div>

        ) : (

          <p className="text-sm text-slate-400">
            No matches yet
          </p>

        )}

      </motion.div>


      {/* NOTICE */}

      <motion.div
        whileHover={{ y: -4 }}
        className="bg-slate-900 text-white rounded-xl p-6 shadow-md relative overflow-hidden"
      >

        <div className="flex items-center gap-2 mb-3">

          <Megaphone size={16} className="text-blue-400"/>

          <h3 className="text-sm font-semibold">
            Notice
          </h3>

        </div>

        <p className="text-sm text-slate-200 leading-relaxed">

          Verify your identity before claiming
          high-value rewards for safety.

        </p>

        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-600/20 blur-3xl"/>

      </motion.div>


      {/* DAILY INSIGHT */}

      <motion.div
        whileHover={{ y: -4 }}
        className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white shadow-md"
      >

        <div className="flex items-center gap-2 mb-4">

          <TrendingUp size={16}/>

          <h3 className="text-sm font-semibold">
            Daily Insight
          </h3>

        </div>

        <div className="flex justify-between items-end">

          <div>

            <p className="text-3xl font-bold leading-none">
              142
            </p>

            <p className="text-xs opacity-70 mt-1">
              Solved Today
            </p>

          </div>

          <div className="text-right">

            <p className="text-3xl font-bold leading-none">
              2.1k
            </p>

            <p className="text-xs opacity-70 mt-1">
              Active Users
            </p>

          </div>

        </div>

      </motion.div>

    </div>

  );

}