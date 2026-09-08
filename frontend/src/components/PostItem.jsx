import React from "react";
import { MapPin, Calendar, Clock, ArrowUpRight, Coins, Tag, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PostItem({ post }) {

  const navigate = useNavigate();

  if (!post) return null;

  const isLost = post.type === "lost";

  const location =
    typeof post.location === "object"
      ? post.location?.address
      : post.location;

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString("en-GB")
    : post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-GB")
    : "";

  return (
    <div
      onClick={() => navigate(`/item/${post._id}`)}
      className="group relative bg-white rounded-[2.5rem] border border-slate-200/60 p-5 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
    >

      {/* TOP BADGES */}

      <div className="flex justify-between items-center mb-4">

        <div className="flex gap-2 items-center">

          {/* TYPE BADGE */}

          <div
            className={`px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
              isLost
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                isLost ? "bg-rose-600" : "bg-emerald-600"
              }`}
            />
            {post.type}
          </div>

          {/* CATEGORY */}

          {post.category && (
            <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-xl text-[10px] font-bold text-slate-600 uppercase">
              <Tag size={10} />
              {post.category}
            </div>
          )}

        </div>

        {/* REWARD */}

        {post.rewardAmount > 0 && isLost && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-2xl border border-amber-100 shadow-sm">
            <Coins size={12} />
            <span className="text-[10px] font-black italic">
              ₹{post.rewardAmount}
            </span>
          </div>
        )}
      </div>


      {/* IMAGE */}

      {post.image && (
        <div className="relative aspect-[16/10] mb-5 rounded-[1.8rem] overflow-hidden bg-slate-100">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}


      {/* CONTENT */}

      <div className="px-1">

        <div className="flex justify-between items-start gap-2 mb-2">

          <h3 className="text-lg font-black text-slate-800 leading-tight tracking-tight italic">
            {post.title}
          </h3>

          <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
            <ArrowUpRight size={16} />
          </div>

        </div>

        <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-2 font-medium">
          {post.description}
        </p>


        {/* FOOTER */}

        <div className="pt-5 border-t border-slate-100 space-y-3">

          {/* LOCATION */}

          <div className="flex items-center gap-3">

            <div className="p-2 bg-indigo-50 rounded-xl">
              <MapPin size={14} className="text-indigo-600" />
            </div>

            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight truncate">
              {location}
            </span>

          </div>


          {/* DATE + STATUS */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-6">

              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={12} />
                <span className="text-[10px] font-bold">
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={12} />
                <span className="text-[10px] font-bold uppercase">
                  {post.status || "Active"}
                </span>
              </div>

            </div>


            {/* POSTED BY */}

            {post.postedBy?.name && (
              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">

                <User size={12} />

                {post.postedBy.name}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}