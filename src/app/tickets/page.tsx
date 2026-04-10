"use client";

import { useEffect, useState } from "react";
import {
  Ticket as TicketIcon, Calendar, MapPin,
  ChevronRight, Download, Zap, Globe, Search, Filter as FilterIcon, Clock
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEvents } from "@/lib/dummyHooks";
import { toast } from "sonner";

function TicketsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 glass-card skeleton-shimmer" />)}
       </div>
    </div>
  );
}

export default function MyTicketsPage() {
  const { getTicketsByUserId, currentUser } = useEvents();
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (currentUser) {
      const userId = (currentUser as any).id;
      const tickets = getTicketsByUserId(userId);
      setUserTickets(tickets);
    }
    setLoading(false);
  }, [currentUser, getTicketsByUserId]);

  const filteredTickets = userTickets.filter(ticket => {
    const matchesSearch = ticket.event?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const eventDate = new Date(ticket.event?.date);
    const now = new Date();
    
    if (filter === "upcoming") return matchesSearch && eventDate >= now;
    if (filter === "past") return matchesSearch && eventDate < now;
    return matchesSearch;
  });

  if (loading) return (
     <div className="min-h-screen bg-dark-bg pt-32 px-6 max-w-7xl mx-auto">
        <TicketsSkeleton />
     </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden pb-32">
       <div className="mesh-gradient opacity-20" />
       
       <div className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
             <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full text-brand-cyan text-[10px] font-black uppercase tracking-widest mb-4">
                  <TicketIcon size={12} />
                  <span>Your Collection</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                   My <span className="text-gradient">Tickets</span>
                </h1>
             </div>

             <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl">
                <button 
                  onClick={() => setFilter("all")}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "all" ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/30" : "text-gray-400 hover:text-white"}`}
                >
                   All
                </button>
                <button 
                  onClick={() => setFilter("upcoming")}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "upcoming" ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/30" : "text-gray-400 hover:text-white"}`}
                >
                   Upcoming
                </button>
                <button 
                  onClick={() => setFilter("past")}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "past" ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/30" : "text-gray-400 hover:text-white"}`}
                >
                   Past
                </button>
             </div>
          </header>

          {/* Search Bar */}
          <div className="relative mb-12 max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
             <input 
               type="text" 
               placeholder="Search by event name..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-brand-purple transition-all"
             />
          </div>

          {/* Content Grid */}
          <AnimatePresence mode="wait">
             <motion.div 
               key={filter + searchQuery}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
             >
                {filteredTickets.length > 0 ? filteredTickets.map((ticket, idx) => {
                   const isPast = new Date(ticket.event?.date) < new Date();
                   return (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     key={ticket.id}
                     className={`glass-card group flex flex-col overflow-hidden ${isPast ? "opacity-60 grayscale-[0.5]" : ""}`}
                   >
                      <div className={`h-2 ${isPast ? "bg-gray-700" : "bg-brand-purple"}`} />
                      <div className="p-6 flex flex-col h-full">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg">
                               {ticket.tier?.name}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">#{ticket.id.slice(-6).toUpperCase()}</span>
                         </div>
                         <h3 className="text-xl font-black text-white mb-2 line-clamp-2 leading-tight group-hover:text-brand-purple transition-colors">
                            {ticket.event?.title}
                         </h3>
                         
                         <div className="space-y-2 mb-6 text-sm text-gray-400 font-medium">
                            <div className="flex items-center gap-2">
                               <Calendar size={14} className="text-brand-purple" />
                               {new Date(ticket.event?.date).toLocaleDateString()} at {ticket.event?.time}
                            </div>
                            <div className="flex items-center gap-2">
                               <MapPin size={14} className="text-brand-cyan" />
                               {ticket.event?.venue}
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${ticket.checkedIn ? "bg-green-500/20 text-green-400" : "bg-brand-purple/20 text-brand-purple-light"}`}>
                                  {ticket.checkedIn ? "Checked In" : "Confirmed"}
                               </span>
                               <span className="text-[10px] text-gray-600 font-bold uppercase underline">#{ticket.qrCode}</span>
                            </div>
                         </div>

                         <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <Link href={`/tickets/${ticket.id}`} className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2">
                               View Entry <ChevronRight size={16} />
                            </Link>
                            <div className="flex gap-3">
                               <Download size={18} className="text-gray-600 hover:text-white cursor-pointer transition-colors" />
                            </div>
                         </div>
                      </div>
                   </motion.div>
                )}) : (
                   <div className="col-span-full py-24 text-center glass-card border-dashed">
                      <TicketIcon size={64} className="mx-auto text-gray-800 mb-6" />
                      <h3 className="text-2xl font-bold text-gray-500 mb-4">No matching tickets found</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">Try adjusting your filters or search query to find the experience you&apos;re looking for.</p>
                      <Link href="/events" className="btn-primary px-12">Browse Experiences</Link>
                   </div>
                )}
             </motion.div>
          </AnimatePresence>
       </div>
    </div>
  );
}

