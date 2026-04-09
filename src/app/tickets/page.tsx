"use client";

import { useEffect, useState } from "react";
import {
  Ticket as TicketIcon, Calendar, MapPin,
  ChevronRight, Download, Zap,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

function TicketSkeleton() {
  return (
    <div className="glass-card flex overflow-hidden border-white/5 rounded-[24px]">
      {/* Left accent bar */}
      <div className="w-1.5 skeleton-shimmer rounded-l-[24px] flex-shrink-0" />
      <div className="p-6 flex-grow space-y-4">
        {/* Tier badge + code */}
        <div className="flex justify-between items-center">
          <div className="h-5 w-20 rounded-lg skeleton-shimmer" />
          <div className="h-4 w-28 rounded skeleton-shimmer" />
        </div>
        {/* Event title */}
        <div className="h-6 w-3/4 rounded-xl skeleton-shimmer" />
        {/* Date + venue */}
        <div className="flex items-center gap-4">
          <div className="h-3.5 w-32 rounded skeleton-shimmer" />
          <div className="h-3.5 w-40 rounded skeleton-shimmer" />
        </div>
        {/* Footer row */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-36 rounded skeleton-shimmer" />
          <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
};

import { useEvents } from "@/context/EventContext";

export default function MyTicketsPage() {
  const { data: session } = useSession();
  const { getTicketsByUserId } = useEvents();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      const userTickets = getTicketsByUserId((session.user as any).id || "demo_user");
      setTickets(userTickets);
    }
    setLoading(false);
  }, [session, getTicketsByUserId]);

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="bg-glow opacity-30" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-brand-purple-light text-[10px] font-black uppercase tracking-widest mb-4">
            <TicketIcon size={11} />
            <span>Your Collection</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-tight">
            My <span className="text-gradient">Tickets</span>
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── Loading skeletons ─────────────────────── */}
          {loading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {[1, 2, 3, 4].map(i => <TicketSkeleton key={i} />)}
            </motion.div>
          )}

          {/* ── Empty state ───────────────────────────── */}
          {!loading && tickets.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-center py-32 glass-card border-white/5 rounded-[2.5rem]"
            >
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto">
                  <TicketIcon size={40} className="text-gray-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center">
                  <Zap size={12} className="text-brand-purple" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
                No Tickets Yet
              </h2>
              <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto leading-relaxed">
                Your purchased experiences will appear here. Start exploring!
              </p>
              <Link href="/events" className="btn-premium">
                Browse Experiences
              </Link>
            </motion.div>
          )}

          {/* ── Ticket list ───────────────────────────── */}
          {!loading && tickets.length > 0 && (
            <motion.div
              key="list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {tickets.map((ticket) => (
                <motion.div key={ticket.id} variants={itemVariants}>
                  <div className="glass-card flex overflow-hidden border-white/5 group hover:border-brand-purple/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-purple/10 rounded-[24px]">
                    {/* Left accent stripe */}
                    <div className="w-1.5 bg-brand-purple group-hover:bg-brand-cyan transition-colors duration-300 rounded-l-[24px] flex-shrink-0" />

                    <div className="p-6 flex-grow min-w-0">
                      {/* Top row */}
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg flex-shrink-0">
                          {ticket.tier?.name}
                        </span>
                        <span className="text-[10px] text-gray-600 font-mono truncate">
                          #{ticket.qrCode?.slice(0, 12)}
                        </span>
                      </div>

                      {/* Event title */}
                      <h3 className="text-lg font-black text-white mb-2 leading-tight line-clamp-1 group-hover:text-brand-purple-light transition-colors">
                        {ticket.event.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-brand-purple" />
                          {new Date(ticket.event.date).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <span className="text-gray-700">•</span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={11} className="text-brand-cyan flex-shrink-0" />
                          {ticket.event.venue}
                        </span>
                      </div>

                      {/* Footer actions */}
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="text-sm font-bold text-brand-purple hover:text-brand-cyan transition-colors flex items-center gap-1 group/link"
                        >
                          View Ticket
                          <ChevronRight
                            size={15}
                            className="group-hover/link:translate-x-0.5 transition-transform"
                          />
                        </Link>
                        <button
                          title="Download ticket"
                          className="p-2 rounded-xl hover:bg-white/8 border border-transparent hover:border-white/10 text-gray-500 hover:text-white transition-all duration-200"
                        >
                          <Download size={17} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
