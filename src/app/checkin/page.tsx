"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ScanLine, CheckCircle2, XCircle, ChevronLeft, 
  Search, Ticket as TicketIcon, Zap 
} from "lucide-react";
import Link from "next/link";
import { useEvents } from "@/context/EventContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckinPage() {
  const router = useRouter();
  const { tickets, checkInTicket } = useEvents();
  const [scanResult, setScanResult] = useState<any>(null);
  const [ticketId, setTicketId] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setIsScanning(true);
    
    setTimeout(() => {
      const ticket = tickets.find(t => t.id === ticketId || t.qrCode === ticketId);
      
      if (!ticket) {
         setScanResult({ success: false, message: "Ticket not found or invalid QR code." });
      } else if (ticket.checkedIn) {
         setScanResult({ success: false, ticket, message: "Ticket has already been used!" });
      } else {
         const success = checkInTicket(ticketId);
         if (success) {
            setScanResult({ success: true, ticket, message: "Check-in Successful!" });
            toast.success("Attendee checked in.");
         } else {
            setScanResult({ success: false, message: "Check-in failed. Try again." });
         }
      }
      setIsScanning(false);
      setTicketId("");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-dark-bg p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1025] to-[#0a0a0a] z-0" />
      <div className="bg-glow absolute inset-0 z-0 opacity-50" />
      
      <div className="max-w-xl mx-auto relative z-10 pt-24 pb-32">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white mb-10 transition-all duration-200 group px-4 py-2.5 rounded-xl hover:bg-white/8 border border-transparent hover:border-white/10"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-200 text-brand-purple" />
          Back to Dashboard
        </button>

        <div className="text-center mb-12">
           <h1 className="text-4xl font-black text-white mb-4">Organizer <span className="text-gradient">Scanner</span></h1>
           <p className="text-gray-400">Validate tickets and check-in attendees seamlessly.</p>
        </div>

        <form onSubmit={handleScan} className="glass-card p-8 border-brand-purple/20 shadow-2xl mb-8 relative overflow-hidden">
           {isScanning && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent animate-scan" />
           )}
           <div className="w-20 h-20 bg-brand-purple/10 border border-brand-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-8 relative">
              {isScanning ? <ScanLine size={40} className="text-brand-cyan animate-pulse" /> : <ScanLine size={40} className="text-brand-purple" />}
           </div>

           <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center block">Enter Ticket ID or QR Hash</label>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                 <input 
                   type="text" 
                   value={ticketId}
                   onChange={e => setTicketId(e.target.value)}
                   placeholder="e.g. TKT-ABC123" 
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-mono uppercase tracking-widest outline-none focus:border-brand-cyan focus:bg-white/10 transition-all text-center"
                   autoFocus
                 />
              </div>
           </div>

           <button 
             type="submit" 
             disabled={isScanning || !ticketId}
             className="w-full mt-6 py-4 bg-brand-purple hover:bg-brand-purple-light text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
           >
              {isScanning ? <Zap className="animate-spin" size={18} /> : "Validate Entry"}
           </button>
        </form>

        <AnimatePresence mode="wait">
           {scanResult && (
              <motion.div 
                key={scanResult.message}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 rounded-2xl border-2 flex items-start gap-4 ${
                  scanResult.success 
                    ? "bg-green-500/10 border-green-500/30 text-green-400" 
                    : scanResult.ticket 
                      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" 
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                 {scanResult.success ? <CheckCircle2 size={32} className="flex-shrink-0" /> : <XCircle size={32} className="flex-shrink-0" />}
                 <div>
                    <h3 className="font-black text-xl mb-1">{scanResult.success ? "Valid Entry" : "Invalid Entry"}</h3>
                    <p className="text-sm font-medium opacity-80 mb-4">{scanResult.message}</p>
                    
                    {scanResult.ticket && (
                       <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-2 text-white font-bold">
                             <TicketIcon size={16} /> {scanResult.ticket.event?.title}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                             <div>
                                <span className="opacity-50 block uppercase tracking-widest mb-1">Tier</span>
                                <span className="text-white font-bold">{scanResult.ticket.tier?.name}</span>
                             </div>
                             <div>
                                <span className="opacity-50 block uppercase tracking-widest mb-1">Holder ID</span>
                                <span className="text-white font-mono">{scanResult.ticket.userId.substring(0,8)}</span>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
}
