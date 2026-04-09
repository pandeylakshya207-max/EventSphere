"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Users, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function Home() {
  const handleQuickLogin = (role: string) => {
    signIn("credentials", {
      email: role === "ORGANISER" ? "organizer@eventsphere.com" : "demo@eventsphere.com",
      password: "demo123",
      callbackUrl: role === "ORGANISER" ? "/organiser" : "/events",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 sm:p-24 overflow-hidden text-white bg-dark-bg w-full">
      {/* Mesh Gradient Background */}
      <div className="mesh-gradient opacity-40" />
      
      {/* Hero Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 text-center max-w-5xl mt-12"
      >
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-brand-purple-light text-[10px] font-black uppercase tracking-[0.2em] mb-8"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>The Future of Event Management</span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-6xl sm:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-glow"
        >
          Launch <br />
          <span className="text-gradient">Experiences</span>
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-gray-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          The all-in-one ticketing platform with AI-powered marketing and 
          lightning-fast check-ins. Built for growth, loved by communities.
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link href="/auth/signin" className="btn-premium group">
            Get Started Free
            <ArrowRight size={18} className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/events" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full font-bold transition-all flex items-center gap-2 shadow-2xl">
            Browse Events
          </Link>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          variants={containerVariants}
          className="mt-32 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left"
        >
          <motion.div variants={itemVariants} className="glass-card p-8 group">
            <div className="w-14 h-14 bg-brand-purple/10 flex items-center justify-center rounded-2xl text-brand-purple mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Zap size={28} />
            </div>
            <h3 className="font-black text-2xl mb-3 tracking-tight">AI Magic</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Generate professional titles and descriptions in seconds with our custom AI models.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="glass-card p-8 group">
            <div className="w-14 h-14 bg-brand-cyan/10 flex items-center justify-center rounded-2xl text-brand-cyan mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Calendar size={28} />
            </div>
            <h3 className="font-black text-2xl mb-3 tracking-tight">Smart Flow</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Easily manage multi-track schedules for large conferences and boutique workshops.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="glass-card p-8 group">
            <div className="w-14 h-14 bg-white/10 flex items-center justify-center rounded-2xl text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <ShieldCheck size={28} />
            </div>
            <h3 className="font-black text-2xl mb-3 tracking-tight">Secured</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Encrypted QR codes for seamless and fraud-proof check-ins at your venue.</p>
          </motion.div>
        </motion.div>
      </motion.div>

      <footer className="mt-32 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em] pb-12">
        © 2026 EventSphere • Built for the Bold
      </footer>
    </main>
  );
}
