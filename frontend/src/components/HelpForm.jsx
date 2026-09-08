import { useState } from "react";
import API from "../services/api";
import { Send, AlertCircle } from "lucide-react";

export default function HelpForm() {
  const [formData, setFormData] = useState({ subject: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/support/report", formData);
      alert("Report Sent! We'll look into it.");
      setFormData({ subject: "", message: "" });
    } catch (err) { alert("Failed to send"); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-md mx-auto">
      <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
        <AlertCircle className="text-red-500"/> Support Desk
      </h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input 
          className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white"
          placeholder="Subject (e.g. Missing Item Issue)"
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          required
        />
        <textarea 
          className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 text-white h-32"
          placeholder="Describe your problem..."
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          required
        />
        <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
          <Send size={14}/> Dispatch Report
        </button>
      </form>
    </div>
  );
}