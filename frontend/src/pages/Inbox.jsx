import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import {
Send, ArrowLeft, Phone, X,
MoreVertical, CheckCheck, ShieldCheck,
Paperclip, Smile, MapPin, Navigation,
Search, MessageSquare, Loader2
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";
import SafeZonePicker from "../components/SafeZonePicker";


socket.on("connect", () => console.log("✅ Connected to Socket Server!", socket.id));
socket.on("connect_error", (err) => console.log("❌ Connection Error:", err.message));

export default function MergedInbox(){

const navigate = useNavigate();

const [chats,setChats] = useState([]);
const [selectedChat,setSelectedChat] = useState(null);
const [loading,setLoading] = useState(true);

const [messages,setMessages] = useState([]);
const [message,setMessage] = useState("");
const [onlineStatus,setOnlineStatus] = useState("offline");

const [previewImage,setPreviewImage] = useState(null);
const [showEmojiPicker,setShowEmojiPicker] = useState(false);
const [showSafePicker,setShowSafePicker] = useState(false);

const scrollRef = useRef(null);
const fileInputRef = useRef(null);

const user = JSON.parse(localStorage.getItem("user")||"{}");
const currentUserId = user._id || user.id;

useEffect(() => {

  fetchChats();

  socket.emit("user_online", currentUserId);

  socket.on("connect", () => {
    if (selectedChat?.roomId) {
      socket.emit("join_chat", selectedChat.roomId);
    }
  });

  socket.on("receive_message",(msg)=>{
    if(selectedChat && msg.roomId===selectedChat.roomId){
      setMessages(prev=>[...prev,msg]);
    }
    fetchChats();
  });

  socket.on("load_messages",(history)=>{
    setMessages(history);
  });

  socket.on("status_update",(data)=>{
    if(selectedChat && String(data.userId)===String(selectedChat.otherUser._id)){
      setOnlineStatus(data.status);
    }
  });

  return ()=>{
    socket.off("receive_message");
    socket.off("load_messages");
    socket.off("status_update");
    socket.off("connect"); // 🔥 IMPORTANT
  };

},[selectedChat,currentUserId]);

useEffect(()=>{
scrollRef.current?.scrollIntoView({behavior:"smooth"});
},[messages]);

const fetchChats = async()=>{
try{
const res = await API.get("/users/my-chats");
setChats(res.data);
setLoading(false);
}catch(err){
console.error(err);
setLoading(false);
}
};

const handleSelectChat=(chat)=>{

setSelectedChat(chat);
setMessages([]);

socket.emit("join_chat",chat.roomId);
socket.emit("get_user_status",chat.otherUser._id);

};

const handleSendMessage = (customPayload = null) => {

  if (!message.trim() && !previewImage && !customPayload) return;

  const finalItemId = customPayload?.itemId || 
                      selectedChat?.item?._id || 
                      selectedChat?.itemId || 
                      selectedChat?.item; 

  const payload = customPayload || {
    text: message,
    image: previewImage,
    senderId: currentUserId,
    receiverId: selectedChat.otherUser._id,
    itemId: finalItemId,
    type: "text",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  socket.emit("send_message", payload);

  setMessage("");
  setPreviewImage(null);
  setShowEmojiPicker(false);
};
const handleSafeZoneSelect=(zone)=>{

const safeMsg = {
  text:`📍 Meeting Point: ${zone.name}`,
  senderId:currentUserId,
  receiverId:selectedChat.otherUser._id,
  itemId:selectedChat.item?._id,
  type:"safe_zone",
  locationData:{
    name:zone.name,
    lat:zone.lat,
    lon:zone.lon
  }
};

handleSendMessage(safeMsg);
setShowSafePicker(false);

};

if(loading){

return(
<div className="h-screen flex flex-col items-center justify-center bg-slate-50">
<Loader2 className="animate-spin text-blue-600 mb-4" size={40}/>
<p className="text-xs text-slate-400 uppercase font-bold">
Loading chats...
</p>
</div>
);

}

return(

<div className="h-screen flex bg-slate-100">

{/* SIDEBAR */}

<aside className={`w-[360px] bg-white border-r flex flex-col ${selectedChat?"hidden lg:flex":"flex"}`}>

<div className="p-6 border-b">

<div className="flex items-center justify-between mb-6">

<button onClick={()=>navigate("/home")}>
<ArrowLeft/>
</button>

<h2 className="font-bold text-lg">
Messages
</h2>

<div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
{user.name?.charAt(0)}
</div>

</div>

<div className="relative">

<Search className="absolute left-3 top-3 text-slate-400"/>

<input
placeholder="Search chats..."
className="w-full pl-10 pr-3 py-3 rounded-xl border"
/>

</div>

</div>

<div className="flex-1 overflow-y-auto">

{chats.map(chat=>(
<div
key={chat.roomId}
onClick={()=>handleSelectChat(chat)}
className="p-4 flex gap-3 hover:bg-slate-50 cursor-pointer"
>

<img
src={chat.otherUser.profileImage||"/default-avatar.png"}
className="w-12 h-12 rounded-xl"
/>

<div className="flex-1">

<div className="flex justify-between">

<p className="font-semibold text-sm">
{chat.otherUser.name}
</p>

<span className="text-xs text-slate-400">
{chat.time}
</span>

</div>

<p className="text-xs text-slate-400 truncate">
{chat.lastMessage}
</p>

</div>

</div>
))}

</div>

</aside>

{/* CHAT */}

<main className={`flex-1 flex flex-col ${!selectedChat?"hidden lg:flex":"flex"}`}>

{selectedChat ? (

<>

<header className="h-20 bg-white border-b flex items-center justify-between px-6">

<div className="flex items-center gap-3">

<button
className="lg:hidden"
onClick={()=>setSelectedChat(null)}
>
<ArrowLeft/>
</button>

<img
src={selectedChat.otherUser.profileImage||"/default-avatar.png"}
className="w-10 h-10 rounded-xl"
/>

<div>

<h3 className="font-semibold">
{selectedChat.otherUser.name}
</h3>

<p className="text-xs text-slate-400">
{onlineStatus}
</p>

</div>

</div>

<div className="flex gap-2">

<button className="p-2 hover:bg-slate-100 rounded-lg">
<Phone/>
</button>

<button className="p-2 hover:bg-slate-100 rounded-lg">
<MoreVertical/>
</button>

</div>

</header>

{/* MESSAGES */}

<div className="flex-1 overflow-y-auto p-6 space-y-6">

{messages.map((msg,i)=>{

const isMe = String(msg.senderId?._id||msg.senderId)===String(currentUserId);

return(

<div
key={i}
className={`flex ${isMe?"justify-end":"justify-start"}`}
>

<div className={`max-w-[70%] p-4 rounded-2xl ${
isMe?"bg-blue-600 text-white":"bg-white border"
}`}>

{msg.image &&(
<img
src={msg.image}
className="rounded-xl mb-2"
/>
)}

<p className="text-sm">
{msg.text}
</p>

<p className="text-[10px] mt-1 opacity-70">
{msg.time}
</p>

</div>

</div>

);

})}

<div ref={scrollRef}/>

</div>

{/* INPUT */}

<footer className="p-4 bg-white border-t">

<div className="flex items-center gap-2">

<button
onClick={()=>setShowSafePicker(true)}
className="p-3 hover:bg-slate-100 rounded-full"
>
<ShieldCheck/>
</button>

<button
onClick={()=>fileInputRef.current.click()}
className="p-3 hover:bg-slate-100 rounded-full"
>
<Paperclip/>
</button>

<input
ref={fileInputRef}
type="file"
hidden
accept="image/*"
onChange={(e)=>{
const reader=new FileReader();
reader.onload=()=>setPreviewImage(reader.result);
reader.readAsDataURL(e.target.files[0]);
}}
/>

<input
className="flex-1 border rounded-xl px-4 py-3"
value={message}
onChange={(e)=>setMessage(e.target.value)}
placeholder="Type message..."
/>

<button
onClick={()=>setShowEmojiPicker(!showEmojiPicker)}
className="p-3 hover:bg-slate-100 rounded-full"
>
<Smile/>
</button>

<button
onClick={()=>handleSendMessage()}
className="p-3 bg-blue-600 text-white rounded-xl"
>
<Send/>
</button>

</div>

</footer>

</>

) : (

<div className="flex-1 flex flex-col items-center justify-center text-slate-400">

<MessageSquare size={50}/>

<p className="mt-4">
Select chat to start messaging
</p>

</div>

)}

</main>

{/* EMOJI */}

<AnimatePresence>

{showEmojiPicker &&(
<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
exit={{opacity:0,y:20}}
className="absolute bottom-24 right-10"
>
<EmojiPicker
onEmojiClick={(e)=>setMessage(prev=>prev+e.emoji)}
/>
</motion.div>
)}

</AnimatePresence>

{/* SAFE ZONE */}

<AnimatePresence>

{showSafePicker &&(

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
className="fixed inset-0 bg-black/60 flex items-center justify-center"
>

<div className="bg-white rounded-2xl p-4 w-[500px]">

<button
onClick={()=>setShowSafePicker(false)}
className="float-right"
>
<X/>
</button>

<SafeZonePicker onSelectLocation={handleSafeZoneSelect}/>

</div>

</motion.div>

)}

</AnimatePresence>

</div>

);

}