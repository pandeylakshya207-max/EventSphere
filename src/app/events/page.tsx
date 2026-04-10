"use client";

import { useEffect, useState, Suspense } from "react";
import {
  Search, Filter, Calendar, MapPin,
  ArrowRight, Grid, Ticket, Zap,
  Music, Camera, Terminal, Palette, Mic2, Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { SkeletonCard } from "@/components/SkeletonCard";
import { supabase } from "../../../lib/supabase";

const categories = [
  { name: "All Experiences", icon: Grid },
  { name: "Music", icon: Music },
  { name: "Standup Comedy", icon: Mic2 },
  { name: "Tech Meetups", icon: Terminal },
  { name: "Workshops", icon: Palette },
  { name: "Art & Media", icon: Camera },
];

function EventsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [events, setEvents] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Experiences");
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH FROM SUPABASE
  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    }

    fetchEvents();
  }, []);

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  const filteredEvents = events.filter(e =>
    !search ||
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.35 } },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-28 pb-24">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col md:flex-row justify-between gap-8 mb-16"
      >
        <div>
          <h1 className="text-6xl font-black text-white">
            Explore <span className="text-brand-purple">Experiences</span>
          </h1>
          <p className="text-gray-400 mt-4">
            Discover amazing events around you
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white"
          />
        </div>
      </motion.div>

      {/* GRID */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredEvents.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-6"
          >
             {filteredEvents.map((event) => (
               <Link key={event.id} href={`/events/${event.id}`}>
                 <motion.div variants={itemVariants}>
                   <div className="group bg-black/60 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-brand-purple/50">
                     <div className="relative w-full h-48 overflow-hidden rounded-t-xl bg-white/5">
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

                     {/* CONTENT */}
                     <div className="p-4">
                       <h2 className="text-white font-bold text-lg leading-tight group-hover:text-brand-purple transition-colors">
                         {event.title}
                       </h2>

                       <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                         {event.description}
                       </p>

                       <div className="mt-3 space-y-1">
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <MapPin size={12} className="text-brand-cyan" /> {event.location}
                          </p>

                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Calendar size={12} className="text-brand-purple" /> {new Date(event.date).toLocaleDateString()}
                          </p>
                       </div>

                       <div className="mt-4">
                         <div className="w-full text-center bg-brand-purple text-white py-2 rounded-lg text-sm font-bold">
                           Register Now
                         </div>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               </Link>
             ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-400 py-20">
            No events found
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
        <EventsContent />
      </Suspense>
    </div>
  );
}

