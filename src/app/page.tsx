"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Users, Zap, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";

export default function Home() {
  const handleQuickLogin = (role: string) => {
    signIn("credentials", {
      email: role === "ORGANISER" ? "organizer@eventsphere.com" : "demo@eventsphere.com",
      password: "demo123",
      callbackUrl: role === "ORGANISER" ? "/organiser" : "/events",
    });
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 sm:p-24 overflow-hidden text-white bg-dark-bg w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1025] to-[#0a0a0a] z-0" />
      <div className="bg-glow absolute inset-0 z-0 opacity-50" />
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 px-6 md:px-12 backdrop-blur-md border-b border-white/5">
        <h1 className="text-2xl font-black tracking-tight">
          Event<span className="text-brand-purple">Sphere</span>
        </h1>
        <div className="flex gap-6 items-center">
          <Link href="/events" className="hidden md:block text-sm font-bold text-gray-400 hover:text-white transition-colors">Browse</Link>
          <button 
            onClick={() => handleQuickLogin("ORGANISER")}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
          >
            Host Demo Login
          </button>
          <button 
            onClick={() => handleQuickLogin("ATTENDEE")}
            className="flex items-center gap-2 bg-brand-purple text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-purple/25 cursor-pointer"
          >
            Attendee Demo Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="z-10 text-center max-w-4xl mt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-brand-purple text-xs font-bold mb-6 animate-pulse">
          <Zap size={14} />
          <span>NEW: AI Event Booster Available</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight leading-tight">
          Host Unforgettable <br />
          <span className="text-gradient">Community Experiences</span>
        </h1>
        
        <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          The all-in-one ticketing platform with AI-powered marketing and 
          lightning-fast check-ins. Built for growth, loved by communities.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/signin" className="btn-primary text-lg px-10">
            Sign Up Now — It's Free
          </Link>
          <Link href="/events" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full font-semibold transition-all flex items-center gap-2">
            Browse Events <ArrowRight size={18} />
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="glass-card p-6">
            <div className="w-12 h-12 bg-brand-purple/10 flex items-center justify-center rounded-xl text-brand-purple mb-4">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-xl mb-2">AI Magic</h3>
            <p className="text-gray-400 text-sm">Generate professional titles and descriptions in seconds.</p>
          </div>
          
          <div className="glass-card p-6">
            <div className="w-12 h-12 bg-brand-cyan/10 flex items-center justify-center rounded-xl text-brand-cyan mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="font-bold text-xl mb-2">Smart Schedule</h3>
            <p className="text-gray-400 text-sm">Easily manage multi-track schedules for large conferences.</p>
          </div>
          
          <div className="glass-card p-6">
            <div className="w-12 h-12 bg-white/10 flex items-center justify-center rounded-xl text-white mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-xl mb-2">Secure Tickets</h3>
            <p className="text-gray-400 text-sm">Encrypted QR codes for seamless and fraud-proof check-ins.</p>
          </div>
        </div>
      </div>

      <footer className="mt-32 text-gray-600 text-sm pb-12">
        © 2026 EventSphere. Designed for the Future of Events.
      </footer>
    </main>
  );
}
