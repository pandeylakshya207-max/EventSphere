"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Zap, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(5);
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  const trendingEvents = events.slice(0, 3);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/events?search=${search}`);
    }
  };

  const handleSurpriseMe = () => {
    if (events.length > 0) {
      const randomIndex = Math.floor(Math.random() * events.length);
      router.push(`/events/${events[randomIndex].id}`);
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg text-white relative flex flex-col items-center">
      <div className="mesh-gradient opacity-30 px-full" />
      
      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-brand-purple-light text-[10px] font-black uppercase tracking-[0.2em] mb-8"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span className="shimmer-text">Launch your next experience</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] text-glow"
        >
          Discover <br />
          <span className="text-gradient">Extraordinary</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          The next-gen ticketing platform for creators and attendees. 
          Seamless, secure, and built for high-performance experiences.
        </motion.p>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-3xl mx-auto mb-16"
        >
          <form onSubmit={handleSearch} className="relative group w-full flex-grow">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-purple transition-colors" size={20} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, venue, or artist..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-brand-purple/50 focus:bg-white/10 transition-all text-white shadow-2xl backdrop-blur-xl"
            />
          </form>
          <button onClick={handleSurpriseMe} className="bg-white/5 border border-white/10 hover:bg-white/10 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all group whitespace-nowrap">
            <Zap size={16} className="text-brand-purple group-hover:animate-bounce" />
            Surprise Me
          </button>
        </motion.div>
      </section>

      {/* ─── Trending / Live Section ───────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-32 z-10">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-12 bg-brand-purple rounded-full" />
             <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Trending Now</h2>
                <p className="text-gray-500 text-sm font-medium">Most anticipated experiences this week</p>
             </div>
          </div>
          <Link href="/events" className="text-brand-purple hover:text-brand-cyan text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-colors group">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {trendingEvents.map((event, idx) => (
             <motion.div 
               key={event.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * idx }}
             >
               <Link href={`/events/${event.id}`}>
                 <div className="group glass-card overflow-hidden">
                    <div className="relative w-full h-64 overflow-hidden rounded-t-xl bg-white/5">
                      <img 
                        src={event.image || "/fallback.jpg"} 
                        alt={event.title} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/fallback.jpg";
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        loading="lazy"
                      />
                    </div>
                      
                      {/* Gradient Overlay for Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                      
                      {event.date === new Date().toISOString().split('T')[0] && (
                         <div className="absolute top-4 left-4 z-20">
                            <div className="live-indicator">
                               <div className="live-dot" />
                               Live Now
                            </div>
                         </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                         <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan mb-1 block">{event.category}</span>
                         <h3 className="text-xl font-bold line-clamp-1 group-hover:text-brand-cyan transition-colors">{event.title}</h3>
                      </div>
                    </div>
               </Link>
             </motion.div>
           ))}
        </div>
      </section>

      {/* ─── Feature CTA Section ──────────────────────────────── */}
      <section className="w-full px-6 pb-40">
        <div className="max-w-5xl mx-auto glass-card p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 group">
           <div className="pulse-glow absolute -top-20 -right-20 w-64 h-64 bg-brand-purple/20 rounded-full" />
           
           <div className="relative z-10 max-w-lg">
              <h2 className="text-4xl font-black mb-4 leading-tight">Host your own <br /><span className="text-gradient">Masterpiece</span></h2>
              <p className="text-gray-400 font-medium mb-8">Ready to bring your vision to life? Launch your event in minutes with our elite toolset.</p>
              <div className="flex items-center gap-8">
                 <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">0%</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Base Fee</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">Inst.</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Payouts</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">24/7</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Support</span>
                 </div>
              </div>
           </div>

           <Link href="/create-event" className="btn-premium px-12 py-6 text-base tracking-[0.2em] relative z-10">
              Host Experience
           </Link>
        </div>
      </section>

      <footer className="w-full border-t border-white/5 py-12 flex flex-col items-center">
        <div className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
          © 2026 EventSphere Platform
        </div>
        <div className="flex gap-6 text-gray-500">
           <span className="text-xs font-bold hover:text-white transition-colors cursor-pointer">Terms</span>
           <span className="text-xs font-bold hover:text-white transition-colors cursor-pointer">Privacy</span>
           <span className="text-xs font-bold hover:text-white transition-colors cursor-pointer">Manifesto</span>
        </div>
      </footer>
    </main>
  );
}
