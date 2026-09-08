import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ChevronRight, Package, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import API from "../services/api";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading,setLoading] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const [error,setError] = useState("");

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Login API call
      const res = await API.post(
  "/auth/login",
  {
    ...form,
    isAdminLogin: false
  }
);
      const { token, user } = res.data;



localStorage.setItem(
  "user_token",
  token
);

localStorage.setItem(
  "user_data",
  JSON.stringify(user)
);
      window.location.href = "/home";

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };


  return (

<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">

{/* Glow background */}

<div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-blue-200 blur-[120px] opacity-40 rounded-full"/>
<div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-indigo-200 blur-[120px] opacity-40 rounded-full"/>


<motion.div
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
className="w-full max-w-md px-6 relative z-10"
>


{/* Logo */}

<div className="flex flex-col items-center mb-10">

<Link to="/" className="flex flex-col items-center">

<motion.div
whileHover={{rotate:10,scale:1.1}}
className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4"
>

<Package size={28}/>

</motion.div>

<h1 className="text-3xl font-black">
Found<span className="text-blue-600">it</span>
</h1>

</Link>

</div>


{/* Card */}

<div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[2rem] shadow-xl">

<h2 className="text-2xl font-bold mb-2">
Welcome Back 👋
</h2>

<p className="text-sm text-gray-400 mb-6">
Login to continue
</p>


{/* Error */}

{error && (
<div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
{error}
</div>
)}


<form onSubmit={handleSubmit} className="space-y-5">


{/* Email */}

<div className="relative">

<Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>

<input
type="email"
name="email"
value={form.email}
onChange={handleChange}
placeholder="Email Address"
required
className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none"
/>

</div>


{/* Password */}

<div className="relative">

<Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>

<input
type={showPassword ? "text" : "password"}
name="password"
value={form.password}
onChange={handleChange}
placeholder="Password"
required
className="w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none"
/>

<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
>

{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}

</button>

</div>


{/* Remember */}

<div className="flex justify-between items-center text-sm">

<label className="flex items-center gap-2 text-gray-500">

<input type="checkbox"/>

Remember me

</label>

<Link
to="/forgot-password"
className="text-blue-600 hover:underline"
>
Forgot password?
</Link>
</div>


{/* Button */}

<motion.button
whileTap={{scale:0.96}}
disabled={loading}
className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition"
>

<AnimatePresence mode="wait">

{loading ? (
<Loader2 className="animate-spin"/>
) : (
<>
Login <ChevronRight size={18}/>
</>
)}

</AnimatePresence>

</motion.button>


</form>


{/* Footer */}

<div className="text-center mt-6 text-sm">

New user?{" "}

<Link
to="/register"
className="text-blue-600 font-semibold hover:underline"
>

Create Account

</Link>

</div>

</div>


{/* Footer Tag */}

<div className="mt-8 flex justify-center gap-2 text-xs text-gray-400">

<ShieldCheck size={14}/>

Secure Authentication

</div>


</motion.div>

</div>

  );
}