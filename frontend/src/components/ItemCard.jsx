import React from "react";
import {
  MapPin,
  MessageCircle,
  ShieldCheck,
  Gift
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ItemCard = ({ item }) => {

  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const isOwner =
    String(currentUser._id || currentUser.id) ===
    String(item.postedBy?._id || item.postedBy);

  const isReturned = item.status === "returned";

  const handleChat = (e) => {
    e.stopPropagation();

    const receiverId = item.postedBy?._id || item.postedBy;

    if (receiverId) {
      navigate(`/chat/${item._id}/${receiverId}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  return (

    <div
      onClick={() => navigate(`/item/${item._id}`)}
      className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
    >

      {/* IMAGE */}

      <div className="relative h-52 overflow-hidden">

        <img
          src={
            item.image ||
            "https://images.unsplash.com/photo-1590247813693-5541d1c609fd"
          }
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />

        {/* GRADIENT OVERLAY */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"/>

        {/* TYPE BADGE */}

        <span
          className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-semibold shadow
          ${
            item.type === "lost"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {item.type.toUpperCase()}
        </span>

        {/* REWARD */}

        {!isReturned &&
          Number(item.rewardAmount) > 0 &&
          item.type === "lost" && (

          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-xs font-semibold shadow">

            <Gift size={12} className="text-blue-600"/>

            ₹{item.rewardAmount}

          </div>

        )}

        {/* DATE */}

        <div className="absolute bottom-3 right-3 text-xs bg-black/60 text-white px-2 py-1 rounded-md">
          {formatDate(item.createdAt)}
        </div>

      </div>

      {/* CONTENT */}

      <div className="p-4 space-y-3">

        {/* TITLE */}

        <h3 className="font-semibold text-slate-800 text-lg leading-snug line-clamp-1">
          {item.title}
        </h3>

        {/* LOCATION */}

        <div className="flex items-center gap-2 text-sm text-slate-500">

          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">

            <MapPin size={14} />

            {item.location?.address?.split(",")[0] || "Unknown"}

          </div>

        </div>

        {/* ACTION */}

        <div className="flex items-center justify-between pt-2">

          {isReturned ? (

            <span className="text-sm font-semibold text-green-600">
              Returned
            </span>

          ) : !isOwner ? (

            <button
              onClick={handleChat}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
            >

              <MessageCircle size={14} />

              Chat

            </button>

          ) : (

            <span className="flex items-center gap-1 text-sm text-slate-400">

              <ShieldCheck size={14} />

              Your Post

            </span>

          )}

        </div>

      </div>

    </div>

  );

};

export default ItemCard;