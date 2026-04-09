"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle2, XCircle, Scan, ShieldAlert, Zap } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ValidateTicketPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    ticket?: any;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep focus on input for hardware scanners
    inputRef.current?.focus();
    
    // Redirect if not logged in
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/validate");
    }
  }, [status, router]);

  const handleScan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!qrCode.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/validate-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qrCode.trim() }),
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Validation request failed");
      setResult({ success: false, message: "Network error occurred." });
    } finally {
      setLoading(false);
      setQrCode(""); // Clear for next scan
      // Maintain focus
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (status === "loading") return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><Zap className="animate-spin text-brand-purple" size={48} /></div>;

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1025] to-[#0a0a0a] z-0" />
      <div className="bg-glow absolute inset-0 z-0 opacity-50" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        <div className="text-center mb-8 gap-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-brand-purple/20 rounded-2xl flex items-center justify-center border border-brand-purple/30">
            <Scan className="text-brand-purple" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Ticket Scanner</h1>
            <p className="text-gray-400">Scan QR or enter ticket ID</p>
          </div>
        </div>

        <div className="glass-card p-6 border-white/10 rounded-3xl shadow-xl">
          <form onSubmit={handleScan} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                autoFocus
                placeholder="Awaiting scan..."
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className="w-full bg-dark-bg/50 border border-brand-purple/30 rounded-2xl py-4 px-6 text-center text-xl font-mono text-white tracking-widest focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all outline-none"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !qrCode.trim()}
              className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? <Zap className="animate-spin" /> : "Validate Ticket"}
            </button>
          </form>
        </div>

        {/* Scan Result Area */}
        {result && (
          <div className={`p-6 rounded-3xl border ${result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            {result.success ? (
              <CheckCircle2 size={48} className="text-green-500 mb-4" />
            ) : (
              <XCircle size={48} className="text-red-500 mb-4" />
            )}
            
            <h2 className={`text-2xl font-black mb-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.message}
            </h2>

            {result.ticket && (
               <div className="w-full mt-4 bg-black/40 rounded-2xl p-4 text-sm text-left grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <div className="text-gray-500 text-xs font-bold uppercase">Guest</div>
                   <div className="text-white font-medium">{result.ticket.guestName}</div>
                 </div>
                 <div className="space-y-1">
                   <div className="text-gray-500 text-xs font-bold uppercase">Tier</div>
                   <div className="text-brand-cyan font-bold">{result.ticket.tierName}</div>
                 </div>
                 <div className="col-span-2 space-y-1 pt-2 border-t border-white/5">
                   <div className="text-gray-500 text-xs font-bold uppercase">Event</div>
                   <div className="text-white">{result.ticket.eventName}</div>
                 </div>
               </div>
            )}
            
            {!result.success && !result.ticket && (
               <div className="flex items-center gap-2 mt-4 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                 <ShieldAlert size={14} /> Please verify with organizer
               </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
