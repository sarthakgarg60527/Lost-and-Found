import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ChevronRight, Package, ShieldCheck, Loader2, KeyRound, Hash } from "lucide-react";
import API from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & New Pass
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // STEP 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/forgot-password", { email: form.email });
      setMessage("Reset code sent to your email! 📩");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "User not found or Server error");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/reset-password", {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      alert("Password reset successful! 🎉");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-blue-200 blur-[120px] opacity-40 rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-indigo-200 blur-[120px] opacity-40 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="flex flex-col items-center">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4"
            >
              <Package size={28} />
            </motion.div>
            <h1 className="text-3xl font-black">
              Found<span className="text-blue-600">it</span>
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[2rem] shadow-xl">
          <h2 className="text-2xl font-bold mb-2">
            {step === 1 ? "Reset Password 🔑" : "Verify Code 🛡️"}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {step === 1 
              ? "Enter your email to receive a reset code" 
              : "Enter the OTP and your new password"}
          </p>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </motion.div>
            )}
            {message && !error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm px-4 py-3 rounded-xl mb-4">
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={step === 1 ? handleSendOTP : handleResetPassword} className="space-y-5">
            {/* Step 1: Email Input */}
            {step === 1 && (
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            )}

            {/* Step 2: OTP & New Password */}
            {step === 2 && (
              <>
                <div className="relative">
                  <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit OTP"
                    required
                    className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="New Secure Password"
                    required
                    className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {step === 1 ? "Send Reset Code" : "Update Password"}
                  <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 text-sm">
            Remembered?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer Tag */}
        <div className="mt-8 flex justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={14} />
          Secure Reset Protocol
        </div>
      </motion.div>
    </div>
  );
}