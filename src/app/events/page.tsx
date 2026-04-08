"use client";

import { useEffect, useState } from "react";
import { 
  Search, Filter, Calendar, MapPin, 
  ChevronRight, ArrowRight, Grid, List as ListIcon,
  Music, Camera, Cpu, Terminal, Palette, Mic2
} from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "All Experiences", icon: Grid },
  { name: "Music", icon: Music },
  { name: "Standup Comedy", icon: Mic2 },
  { name: "Tech Meetups", icon: Terminal },
  { name: "Workshops", icon: Palette },
  { name: "Art & Media", icon: Camera },
];

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState("All Experiences");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = activeCategory === "All Experiences" 
    ? events 
    : events.filter(e => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-12 relative overflow-hidden">
      <div className="bg-glow opacity-30" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              Explore <span className="text-gradient">Experiences</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Discover cutting-edge events, workshops, and gatherings happening in your city.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-4">
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-purple transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search events, artists, venues..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-brand-purple/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-600 shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 border ${
                activeCategory === cat.name 
                ? "bg-brand-purple border-brand-purple text-white shadow-lg shadow-brand-purple/20" 
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <cat.icon size={18} />
              <span className="font-bold text-sm tracking-wide">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] bg-white/5 rounded-[2rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Link 
                key={event.id}
                href={`/events/${event.id}`}
                className="group glass-card rounded-[2rem] overflow-hidden border-white/5 hover:border-brand-purple/30 transition-all duration-500 transform hover:-translate-y-2 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000&auto=format&fit=crop"} 
                    alt={event.title} 
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000&auto=format&fit=crop" }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md text-brand-cyan text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                </div>
                
                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-white group-hover:text-brand-purple transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-gray-400">
                      <Calendar size={16} className="text-brand-purple" />
                      <span className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <MapPin size={16} className="text-brand-cyan" />
                      <span className="text-sm font-medium">{event.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Starts from</span>
                      <span className="text-xl font-black text-white">₹{event.tiers?.[0]?.price || event.price}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-purple transition-all duration-300">
                      <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-24 glass-card border-white/5 rounded-[2rem]">
            <div className="text-gray-500 mb-4 flex justify-center">
              <Filter size={48} className="opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No experiences found</h3>
            <p className="text-gray-500">Try selecting a different category or refining your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
