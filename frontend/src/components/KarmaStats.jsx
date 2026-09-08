import { motion, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Trophy, Star, ShieldCheck, Zap, TrendingUp } from "lucide-react";

export default function KarmaStats({ user }) {

  const ref = useRef();
  const karma = user?.karmaPoints || 0;

  const getRank = (p) => {
    if (p >= 500) return { label: "Legend", icon: <Trophy />, color: "text-yellow-500", next: 1000 };
    if (p >= 200) return { label: "Pro", icon: <Star />, color: "text-blue-500", next: 500 };
    if (p >= 50) return { label: "Active", icon: <ShieldCheck />, color: "text-green-500", next: 200 };
    return { label: "New", icon: <Zap />, color: "text-gray-400", next: 50 };
  };

  const rank = getRank(karma);
  const progress = (karma / rank.next) * 100;

  useEffect(() => {
    const controls = animate(0, karma, {
      duration: 1.5,
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.floor(v);
      }
    });
    return () => controls.stop();
  }, [karma]);

  return (
    <div className="space-y-6">

      {/* MAIN CARD */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border">

        <h3 className="font-bold text-lg mb-4">Karma Score</h3>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p ref={ref} className="text-4xl font-bold">0</p>
            <p className="text-xs text-slate-400">Points</p>
          </div>

          <div className={`p-4 rounded-xl bg-slate-100 ${rank.color}`}>
            {rank.icon}
          </div>
        </div>

        {/* PROGRESS */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-indigo-600"
          />
        </div>

        <p className="text-xs text-slate-400 mt-2">
          {rank.next - karma} points to next level
        </p>

      </div>

      {/* EXTRA STATS (IMPORTANT - removes empty feel) */}
      <div className="bg-white rounded-3xl p-6 shadow border space-y-4">

        <h3 className="font-semibold">Stats</h3>

        <div className="grid grid-cols-2 gap-4">

          <div className="bg-slate-50 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-400">Found</p>
            <p className="font-bold text-lg">{user?.itemsFound || 0}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-center">
            <p className="text-xs text-slate-400">Trust</p>
            <p className="font-bold text-lg">98%</p>
          </div>

        </div>

      </div>

      {/* CTA PANEL */}
      <div className="bg-indigo-600 text-white rounded-3xl p-6">

        <h3 className="font-bold mb-2">Boost your Karma 🚀</h3>
        <p className="text-xs opacity-80 mb-4">
          Help more users and increase your trust score
        </p>

        <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold">
          View Tips
        </button>

      </div>

    </div>
  );
}