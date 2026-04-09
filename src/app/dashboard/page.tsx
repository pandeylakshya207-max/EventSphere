"use client";

import { useEffect, useState } from "react";
import {
  Ticket as TicketIcon, Calendar, MapPin,
  ChevronRight, Download, Zap, LayoutDashboard,
  Users, BarChart3, Plus, Globe
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEvents } from "@/context/EventContext";

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-24 glass-card skeleton-shimmer" />)}
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-40 glass-card skeleton-shimmer" />)}
       </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { getTicketsByUserId, getEventsByOrganizerId } = useEvents();
  const [tickets, setTickets] = useState<any[]>([]);
  const [hostedEvents, setHostedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"attending" | "hosting">("attending");

  useEffect(() => {
    if (session) {
      const userId = (session.user as any).id || "demo_user_id";
      setTickets(getTicketsByUserId(userId));
      setHostedEvents(getEventsByOrganizerId(userId));
    }
    setLoading(false);
  }, [session, getTicketsByUserId, getEventsByOrganizerId]);

  if (loading) return (
     <div className="min-h-screen bg-dark-bg pt-32 px-6 max-w-7xl mx-auto">
        <DashboardSkeleton />
     </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden pb-32">
       <div className="mesh-gradient opacity-20" />
       
       <div className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
             <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-brand-purple-light text-[10px] font-black uppercase tracking-widest mb-4">
                  <LayoutDashboard size={12} />
                  <span>Personal Hub</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                   My <span className="text-gradient">Dashboard</span>
                </h1>
             </div>

             <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl">
                <button 
                  onClick={() => setActiveTab("attending")}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "attending" ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/30" : "text-gray-500 hover:text-white"}`}
                >
                   Attending
                </button>
                <button 
                  onClick={() => setActiveTab("hosting")}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "hosting" ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/30" : "text-gray-500 hover:text-white"}`}
                >
                   Hosting
                </button>
             </div>
          </header>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
             <div className="glass-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                   <TicketIcon size={24} />
                </div>
                <div>
                   <div className="text-2xl font-black text-white">{tickets.length}</div>
                   <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Tickets</div>
                </div>
             </div>
             <div className="glass-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                   <Users size={24} />
                </div>
                <div>
                   <div className="text-2xl font-black text-white">{hostedEvents.length}</div>
                   <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Experiences Hosted</div>
                </div>
             </div>
             <div className="glass-card p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                   <BarChart3 size={24} />
                </div>
                <div>
                   <div className="text-2xl font-black text-white">Top 1%</div>
                   <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Explorer Rank</div>
                </div>
             </div>
          </div>

          {/* Content Grid */}
          <AnimatePresence mode="wait">
             {activeTab === "attending" ? (
                <motion.div 
                  key="attending"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                   {tickets.length > 0 ? tickets.map((ticket, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={ticket.id}
                        className="glass-card group flex flex-col overflow-hidden"
                      >
                         <div className="h-2 bg-brand-purple" />
                         <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                               <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg">
                                  {ticket.tier?.name}
                               </span>
                               <span className="text-[10px] text-gray-600 font-mono">#{ticket.id.slice(-6).toUpperCase()}</span>
                            </div>
                            <h3 className="text-xl font-black text-white mb-6 line-clamp-2 leading-tight group-hover:text-brand-purple transition-colors">{ticket.event.title}</h3>
                            <div className="flex items-center justify-between mt-auto">
                               <Link href={`/tickets/${ticket.id}`} className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2">
                                  View Entry <ChevronRight size={16} />
                               </Link>
                               <Download size={16} className="text-gray-600 hover:text-white cursor-pointer" />
                            </div>
                         </div>
                      </motion.div>
                   )) : (
                      <div className="col-span-full py-20 text-center glass-card border-dashed">
                         <TicketIcon size={48} className="mx-auto text-gray-700 mb-6" />
                         <h3 className="text-xl font-bold text-gray-400 mb-8">No tickets found in your collection</h3>
                         <Link href="/events" className="btn-primary px-8">Find Experiences</Link>
                      </div>
                   )}
                </motion.div>
             ) : (
                <motion.div 
                  key="hosting"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                   {hostedEvents.length > 0 ? hostedEvents.map((event, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={event.id}
                        className="glass-card overflow-hidden group border-white/5 hover:border-brand-purple/40 transition-all duration-500 shadow-2xl hover:shadow-brand-purple/10"
                      >
                         <div className="relative h-40 overflow-hidden bg-white/5">
                            <img 
                              src={event.image} 
                              onError={e => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600&auto=format&fit=crop";
                              }}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              alt={event.title} 
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-full text-[10px] font-black text-brand-cyan uppercase tracking-widest z-20">
                               {event.category}
                            </div>
                         </div>
                         <div className="p-6 relative z-10 bg-gradient-to-b from-transparent to-black/20">
                            <h3 className="text-lg font-black text-white mb-4 line-clamp-1 group-hover:text-brand-cyan transition-colors">{event.title}</h3>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">
                               <span className="flex items-center gap-1.5"><Calendar size={12} className="text-brand-purple" /> {new Date(event.date).toLocaleDateString()}</span>
                               <span className="flex items-center gap-1.5"><Users size={12} className="text-brand-cyan" /> {Math.floor(Math.random() * 50)} Sold</span>
                            </div>
                            <Link href={`/events/${event.id}`} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest text-white">
                               Manage Experience
                            </Link>
                         </div>
                      </motion.div>
                   )) : (
                      <div className="col-span-full py-20 text-center glass-card border-dashed">
                         <Plus size={48} className="mx-auto text-gray-700 mb-6" />
                         <h3 className="text-xl font-bold text-gray-400 mb-8">You haven&apos;t hosted any experiences yet</h3>
                         <Link href="/create-event" className="btn-primary px-8">Launch Experience</Link>
                      </div>
                   )}
                </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}
