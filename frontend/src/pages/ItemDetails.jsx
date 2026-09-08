import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  MapPin,
  Calendar,
  ArrowLeft,
  Loader2,
  Trash2,
  CheckCircle2,
  Gift,
  ShieldCheck
} from "lucide-react";

export default function ItemDetails() {

const { id } = useParams();
const navigate = useNavigate();

const [item,setItem] = useState(null);
const [loading,setLoading] = useState(true);

const [otpSent,setOtpSent] = useState(false);
const [generatedKey,setGeneratedKey] = useState("");
const [inputOtp,setInputOtp] = useState("");

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

useEffect(()=>{
fetchItem();
},[id]);

const fetchItem = async ()=>{
try{
const res = await API.get(`/items/${id}`);
const data = res.data.item || res.data;
setItem(data);
}catch(err){
console.error(err);
}
finally{
setLoading(false);
}
};

const isOwner =
(item?.postedBy?._id || item?.postedBy) ===
(currentUser?._id || currentUser?.id);

const handleDelete = async ()=>{
if(!window.confirm("Delete this post?")) return;
await API.delete(`/items/${id}`);
navigate("/home");
};

const handleGenerateOTP = async ()=>{
const res = await API.post(`/items/generate-otp/${id}`);
setGeneratedKey(res.data.otp);
setOtpSent(true);
};

const handleVerify = async ()=>{
if(inputOtp.length !== 6) return alert("Enter valid code");

await API.post("/items/verify-handover",{
itemId:id,
inputOtp
});

alert("Verified!");
fetchItem();
};

if(loading){
return(
<div className="min-h-screen flex items-center justify-center bg-slate-100">
<Loader2 className="animate-spin text-indigo-600" size={32}/>
</div>
);
}

if(!item){
return <div className="p-10 text-center">Item not found</div>
}

return(

<div className="min-h-screen bg-slate-100 py-12 px-6">

{/* HEADER */}

<div className="max-w-6xl mx-auto flex items-center gap-4 mb-8">

<button
onClick={()=>navigate(-1)}
className="p-2 bg-white rounded-xl shadow hover:shadow-md"
>
<ArrowLeft/>
</button>

<h1 className="text-xl font-bold text-slate-800">
Item Details
</h1>

</div>

{/* MAIN CARD */}

<div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl grid lg:grid-cols-2 overflow-hidden">

{/* IMAGE */}

<div className="relative bg-slate-50">

<img
src={item.image}
className="w-full h-[500px] object-cover"
/>

{/* TYPE BADGE */}

<div className="absolute top-5 left-5 flex gap-2">

<span className={`px-3 py-1 text-xs rounded-full font-bold shadow
${item.type==="lost"
? "bg-red-500 text-white"
: "bg-green-500 text-white"
}`}>
{item.type.toUpperCase()}
</span>

<span className={`px-3 py-1 text-xs rounded-full font-bold
${item.status==="returned"
? "bg-green-100 text-green-700"
: "bg-yellow-100 text-yellow-700"
}`}>
{item.status}
</span>

</div>

</div>

{/* RIGHT CONTENT */}

<div className="p-10 flex flex-col justify-between">

<div className="space-y-6">

{/* TITLE */}

<div>

<h2 className="text-3xl font-bold text-slate-800">
{item.title}
</h2>

<p className="text-sm text-slate-400 mt-1">
Posted {new Date(item.createdAt).toDateString()}
</p>

</div>

{/* LOCATION */}

<div className="flex flex-col gap-3 text-sm">

<div className="flex items-center gap-2 text-slate-600">

<MapPin size={16}/>
{item.location?.address}

</div>

<div className="flex items-center gap-2 text-slate-600">

<Calendar size={16}/>
{new Date(item.createdAt).toLocaleDateString()}

</div>

</div>

{/* REWARD */}

{item.rewardAmount>0 && item.status!=="returned" &&(

<div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 p-5 rounded-2xl flex justify-between items-center">

<div className="flex items-center gap-2 text-orange-600 font-semibold">

<Gift size={18}/>
Reward

</div>

<span className="text-xl font-bold text-orange-700">
₹{item.rewardAmount}
</span>

</div>

)}

{/* DESCRIPTION */}

<div>

<h3 className="font-semibold text-slate-800 mb-2">
Description
</h3>

<p className="text-sm text-slate-500 leading-relaxed">
{item.description || "No description provided"}
</p>

</div>

</div>

{/* ACTION AREA */}

<div className="mt-10 space-y-4">

{item.status !== "returned" ? (

isOwner ? (

<>

{/* GENERATE OTP */}

{!otpSent ?(

<button
onClick={handleGenerateOTP}
className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold shadow hover:shadow-lg"
>
Generate Security Code
</button>

):(

<div className="bg-indigo-950 text-white p-6 rounded-xl text-center">

<p className="text-xs mb-1 text-indigo-300">
Security Code
</p>

<h2 className="text-3xl font-mono">
{generatedKey}
</h2>

</div>

)}

{/* DELETE */}

<button
onClick={handleDelete}
className="w-full border border-red-200 text-red-500 py-3 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"
>

<Trash2 size={16}/>
Delete Post

</button>

</>

):(

// VERIFY USER

<>

<input
value={inputOtp}
onChange={(e)=>setInputOtp(e.target.value)}
placeholder="Enter 6 digit code"
className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none"
/>

<button
onClick={handleVerify}
className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-black flex items-center justify-center gap-2"
>

<ShieldCheck size={16}/>
Verify Item

</button>

</>

)

):(

// RETURNED

<div className="bg-green-100 p-4 rounded-xl flex gap-2 text-green-700 font-medium">

<CheckCircle2/>
Item returned successfully

</div>

)}

</div>

</div>

</div>

</div>

);

}