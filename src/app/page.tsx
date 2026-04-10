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
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

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

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-brand-purple-light text-[10px] font-black uppercase tracking-[0.2em] mb-8"
        >
          <Sparkles size={12} />
          <span>Launch your next experience</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-9xl font-black mb-8"
        >
          Discover <br />
          <span className="text-gradient">Extraordinary</span>
        </motion.h1>

        <motion.p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
          The next-gen ticketing platform for creators and attendees.
        </motion.p>

        <motion.div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-3xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative w-full flex-grow">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6"
            />
          </form>

          <button
            onClick={handleSurpriseMe}
            className="bg-white/5 border px-8 py-5 rounded-2xl flex items-center gap-2"
          >
            <Zap size={16} />
            Surprise Me
          </button>
        </motion.div>
      </section>

      {/* TRENDING */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-32 z-10">
        <div className="flex justify-between mb-12">
          <h2 className="text-3xl font-black">Trending Now</h2>

          <Link href="/events" className="flex items-center gap-2">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingEvents.map((event, idx) => {
            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <div className="group glass-card overflow-hidden relative">

                    {/* IMAGE */}
                    <div className="relative w-full h-64 overflow-hidden rounded-t-xl bg-white/5">
                      <img
                        src={event.image || "/fallback.jpg"}
                        alt={event.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/fallback.jpg";
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* CONTENT */}
                    <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                      <span className="text-xs text-brand-cyan">
                        {event.category}
                      </span>
                      <h3 className="text-lg font-bold">{event.title}</h3>
                    </div>

                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 py-12 text-center">
        <div className="text-gray-600 text-xs">
          © 2026 EventSphere Platform
        </div>
      </footer>
    </main>
  );
}