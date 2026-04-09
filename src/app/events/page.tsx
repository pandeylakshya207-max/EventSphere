"use client";

import { useEffect, useState, Suspense } from "react";
import { 
  Search, Filter, Calendar, MapPin, 
  ArrowRight, Grid, Ticket, Zap,
  Music, Camera, Cpu, Terminal, Palette, Mic2, Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useEvents } from "@/context/EventContext";

const categories = [
  { name: "All Experiences", icon: Grid },
  { name: "Music", icon: Music },
  { name: "Standup Comedy", icon: Mic2 },
  { name: "Tech Meetups", icon: Terminal },
  { name: "Workshops", icon: Palette },
  { name: "Art & Media", icon: Camera },
];

function EventsContent() {
  const { events } = useEvents();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [activeCategory, setActiveCategory] = useState("All Experiences");
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
    
    // Simulate initial loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [initialSearch]);

  const filteredEvents = events
    .filter(e => activeCategory === "All Experiences" || e.category === activeCategory)
    .filter(e =>
      !search ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.toLowerCase().includes(search.toLowerCase())
    );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-brand-purple-light text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} />
            <span>Discover the Extraordinary</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85]">
            Explore <br />
            <span className="text-gradient">Experiences</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl font-medium">
            Join the most exclusive workshops, conferences, and high-energy gatherings.
          </p>
        </div>

        {/* Search */}
        <div className="relative group w-full md:w-80 flex-shrink-0">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-purple transition-colors"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events, artists, venues..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-brand-purple/50 focus:bg-white/8 transition-all text-white placeholder:text-gray-600 shadow-xl backdrop-blur-md text-sm"
          />
        </div>
      </motion.div>

      {/* Categories Bar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3 overflow-x-auto pb-10 no-scrollbar"
      >
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 border-2 text-xs font-black uppercase tracking-widest ${
              activeCategory === cat.name
                ? "bg-brand-purple border-brand-purple text-white shadow-2xl shadow-brand-purple/40 scale-105"
                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:text-white"
            }`}
          >
            <cat.icon size={16} className={activeCategory === cat.name ? "animate-pulse" : ""} />
            {cat.name}
          </button>
        ))}
      </motion.div>

      {/* Events Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </motion.div>
        ) : filteredEvents.length > 0 ? (
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <div className="group glass-card rounded-[32px] overflow-hidden flex flex-col h-full border-white/5 hover:border-brand-purple/40 transition-all duration-500 shadow-2xl shadow-black/50 hover:shadow-brand-purple/10">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-white/5 flex-shrink-0 group-hover:shadow-2xl transition-all duration-500">
                    <img
                      src={event.image}
                      alt={event.title}
                      onError={e => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600&auto=format&fit=crop";
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                    {/* Category badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                      <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-xl text-brand-cyan text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-lg w-fit">
                        {event.category}
                      </span>
                      {event.date === new Date().toISOString().split('T')[0] && (
                         <div className="live-indicator w-fit">
                            <div className="live-dot" />
                            Live Now
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white mb-4 leading-tight tracking-tight group-hover:text-brand-purple-light transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      <div className="space-y-2.5 mb-5">
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Calendar size={13} className="text-brand-purple" />
                          </div>
                          <span className="text-sm font-semibold">
                            {new Date(event.date).toLocaleDateString("en-GB", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <MapPin size={13} className="text-brand-cyan" />
                          </div>
                          <span className="text-sm font-semibold line-clamp-1">{event.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-5 border-t border-white/8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.15em] mb-0.5">
                            From
                          </div>
                          <div className="text-xl font-black text-white group-hover:text-brand-cyan transition-colors">
                            ₹{event.tiers?.[0]?.price ?? event.price}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          <Ticket size={12} className="text-brand-purple" />
                          {event.tiers?.[0]?.capacity ?? "—"} left
                        </div>
                      </div>

                      {/* Register Now CTA */}
                      <Link
                        href={`/events/${event.id}`}
                        className="w-full btn-primary justify-center py-3 text-sm group-hover:shadow-brand-purple/50"
                      >
                        Register Now
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-32 glass-card rounded-[40px]"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter size={32} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">No Experiences Found</h3>
            <p className="text-gray-500 font-medium mb-8">
              {search
                ? `No results for "${search}". Try a different keyword.`
                : "Try selecting a different category or refining your search."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="btn-primary px-6 py-3"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background */}
      <div className="mesh-gradient opacity-30 px-full" />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Zap className="animate-spin text-brand-purple" size={48} /></div>}>
        <EventsContent />
      </Suspense>
    </div>
  );
}
