"use client";

import { useEffect, useState } from "react";
import { 
  Ticket as TicketIcon, Calendar, MapPin, 
  ChevronRight, ArrowRight, Zap, Download
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function MyTicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchTickets();
    }
  }, [session]);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (res.ok) {
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white"><Zap className="animate-spin text-brand-purple" /></div>;

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-12 relative overflow-hidden">
      <div className="bg-glow opacity-30" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <h1 className="text-4xl font-black text-white mb-12">My <span className="text-gradient">Tickets</span></h1>

        {tickets.length === 0 ? (
          <div className="text-center py-24 glass-card border-white/5 rounded-[2rem]">
            <TicketIcon size={64} className="mx-auto text-gray-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No tickets yet</h2>
            <p className="text-gray-500 mb-8">Your purchased experiences will appear here.</p>
            <Link href="/events" className="btn-primary py-3 px-8">Browse Experiences</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="glass-card flex overflow-hidden border-white/5 group hover:border-brand-purple/30 transition-all">
                <div className="w-4 bg-brand-purple group-hover:bg-brand-cyan transition-colors" />
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan px-2 py-0.5 bg-brand-cyan/10 rounded">
                      {ticket.tier?.name}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">#{ticket.qrCode}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{ticket.event.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar size={12} /> {new Date(ticket.event.date).toLocaleDateString()}
                    <MapPin size={12} className="ml-2" /> {ticket.event.venue}
                  </div>
                  <div className="flex items-center justify-between">
                    <Link href={`/tickets/${ticket.id}`} className="text-sm font-bold text-brand-purple hover:text-brand-cyan transition-colors flex items-center gap-1">
                      View Digital Ticket <ChevronRight size={16} />
                    </Link>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
