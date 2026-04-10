"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Shield, Save, ArrowLeft, 
  MapPin, Globe, Calendar, LogOut, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEvents } from "@/lib/dummyHooks";
import { toast } from "sonner";

export default function AccountPage() {
  const { currentUser, updateUser, logout } = useEvents();
  const user = currentUser;
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      updateUser({ name });
      setLoading(false);
      toast.success("Profile updated successfully! ✨");
    }, 800);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
        <div className="text-center space-y-6">
           <User size={64} className="mx-auto text-gray-800" />
           <h1 className="text-2xl font-bold text-gray-400">Please sign in to view your account</h1>
           <Link href="/auth/signin" className="btn-primary px-8">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden pb-32">
       <div className="mesh-gradient opacity-10" />
       
       <div className="max-w-4xl mx-auto px-6 pt-32 relative z-10">
          {/* Breadcrumb */}
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors group">
             <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
             Back to Experiences
          </Link>

          <div className="flex flex-col md:flex-row gap-12">
             {/* Left Column: Profile Card */}
             <div className="flex-shrink-0 w-full md:w-72">
                <div className="glass-card p-8 border-brand-purple/20 text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple to-brand-cyan" />
                   
                   <div className="w-24 h-24 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 mx-auto mb-6 flex items-center justify-center text-4xl font-black text-brand-purple-light shadow-2xl">
                      {user.name?.[0]?.toUpperCase()}
                   </div>
                   
                   <h2 className="text-xl font-black text-white mb-1 line-clamp-1">{user.name}</h2>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">{user.role || "Explorer"}</p>
                   
                   <div className="space-y-3 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                         <MapPin size={14} className="text-brand-cyan" /> Remote
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                         <Globe size={14} className="text-brand-purple" /> English (India)
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                         <Calendar size={14} className="text-gray-500" /> Joined April 2026
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Column: Settings Form */}
             <div className="flex-grow space-y-8">
                <section>
                   <div className="flex items-center gap-3 mb-8">
                      <div className="w-1.5 h-8 bg-brand-cyan rounded-full" />
                      <h1 className="text-4xl font-black text-white tracking-tighter">Account <span className="text-gradient">Settings</span></h1>
                   </div>

                   <form onSubmit={handleUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                               <User size={12} /> Full Name
                            </label>
                            <input 
                               type="text" 
                               value={name}
                               onChange={(e) => setName(e.target.value)}
                               className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-brand-purple transition-all font-semibold"
                               placeholder="Your name"
                            />
                         </div>
                         
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                               <Mail size={12} /> Email Address
                            </label>
                            <input 
                               type="email" 
                               value={email}
                               disabled
                               className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-gray-500 outline-none cursor-not-allowed font-semibold opacity-60"
                               placeholder="your@email.com"
                            />
                            <p className="text-[9px] text-gray-600 font-bold uppercase mt-1 ml-1 flex items-center gap-1">
                               <CheckCircle2 size={10} className="text-brand-cyan" /> Verified via Demo Credentials
                            </p>
                         </div>
                      </div>

                      <div className="pt-6">
                         <button 
                           type="submit" 
                           disabled={loading}
                           className="btn-primary w-full md:w-auto px-12 py-4 flex items-center justify-center gap-3 shadow-2xl shadow-brand-purple/30 group"
                         >
                            {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <Save size={18} className="group-hover:scale-110 transition-transform" /> }
                            Save Profile Changes
                         </button>
                      </div>
                   </form>
                </section>

                {/* Privacy & Security Placeholder */}
                <section className="pt-12 border-t border-white/5">
                   <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                      <Shield size={16} /> Privacy & Security
                   </h3>
                   <div className="glass-card p-6 border-dashed opacity-50 flex items-center justify-between">
                      <div className="text-sm text-gray-400 font-bold">Two-Factor Authentication</div>
                      <span className="text-[10px] font-black uppercase py-1 px-3 bg-white/5 rounded-full text-gray-600">Coming Soon</span>
                   </div>
                </section>
             </div>
          </div>
       </div>
    </div>
  );
}

