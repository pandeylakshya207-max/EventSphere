"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useEvents } from "@/context/EventContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, ShieldCheck, Plus, Minus, CheckCircle, Ticket as TicketIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const tierId = searchParams.get("tier");
  const router = useRouter();
  const { data: session } = useSession();
  const { getEventById, bookTicket } = useEvents();

  const [event, setEvent] = useState<any>(null);
  const [tier, setTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);

  useEffect(() => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/events/${id}/checkout?tier=${tierId}`);
      return;
    }

    const data = getEventById(id as string);
    if (data) {
      setEvent(data);
      const selectedTier = data.tiers?.find((t: any) => t.id === tierId);
      if (selectedTier) setTier(selectedTier);
    }
    setLoading(false);
  }, [id, tierId, session, router, getEventById]);

  const applyDiscount = () => {
    if (!event || !event.discountCodes) {
       toast.error("Invalid discount code");
       return;
    }
    const found = event.discountCodes.find((d: any) => d.code.toUpperCase() === discountCode.toUpperCase());
    if (found) {
      setAppliedDiscount(found);
      toast.success(`${found.discountPercent}% Discount Applied!`);
    } else {
      toast.error("Invalid discount code");
      setAppliedDiscount(null);
    }
  };

  const handlePayment = async () => {
    if (!tier) return;
    setBookingLoading(true);

    try {
      // Direct booking in context for demo
      const newTickets = bookTicket(
        id as string, 
        tier.id, 
        (session?.user as any).id || "demo_user", 
        quantity
      );
      
      setGeneratedTickets(newTickets);
      setShowSuccess(true);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong during checkout");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><Zap className="animate-spin text-brand-purple" size={48} /></div>;
  if (!event || !tier) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Event or Tier not found</div>;

  const subtotal = tier.price * quantity;
  const discountAmount = appliedDiscount ? (subtotal * (appliedDiscount.discountPercent / 100)) : 0;
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-12 relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1025] to-[#0a0a0a] z-0" />
      <div className="bg-glow absolute inset-0 z-0 opacity-50" />
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="glass-card max-w-lg w-full p-10 text-center border-brand-purple/30 relative overflow-hidden"
            >
              <div className="pulse-glow absolute -top-24 -left-24 w-48 h-48 bg-brand-purple/20 rounded-full" />
              <div className="pulse-glow absolute -bottom-24 -right-24 w-48 h-48 bg-brand-cyan/20 rounded-full" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-brand-purple/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-purple/30">
                  <CheckCircle size={48} className="text-brand-purple animate-bounce" />
                </div>
                
                <h2 className="text-4xl font-black mb-4 tracking-tight">Booking Confirmed!</h2>
                <p className="text-gray-400 font-medium mb-10 leading-relaxed">
                   Success! Your tickets for <span className="text-white font-bold">{event.title}</span> have been generated. You can find them in your dashboard.
                </p>

                <div className="flex flex-col gap-4">
                  <Link 
                    href={`/tickets/${generatedTickets[0]?.id}`}
                    className="btn-premium w-full py-4 text-sm tracking-widest"
                  >
                    View Official Ticket
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <TicketIcon size={18} />
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => {
          if (window.history.length > 2) {
            router.back();
          } else {
            router.push(`/events/${id}`);
          }
        }}
        className="absolute top-24 left-6 sm:left-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-all duration-200 z-[60] group px-3 py-2 rounded-xl hover:bg-white/8 border border-transparent hover:border-white/10 cursor-pointer"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200 font-black" />
        Back to Event
      </button>

      <div className="max-w-4xl mx-auto relative z-10 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-black mb-2 flex items-center gap-3 text-white">Review Order</h1>
              <p className="text-gray-400">Complete your secure checkout</p>
            </div>

            <div className="glass-card p-6 border-brand-purple/20">
              <div className="flex gap-4 items-center border-b border-white/5 pb-6 mb-6">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                  <div className="absolute inset-0 bg-dark-bg/20 z-10" />
                  <img 
                    src={event.image} 
                    className="w-full h-full object-cover" 
                    alt={event.title} 
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600&auto=format&fit=crop" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-brand-cyan font-bold uppercase tracking-widest">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="text-gray-300">
                  <span className="font-bold block text-white">{tier.name} Ticket</span>
                  <span className="text-xs">₹{tier.price} per ticket</span>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors"><Minus size={16} /></button>
                  <span className="font-black w-6 text-center text-white">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors"><Plus size={16} /></button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] bg-white/5 p-4 rounded-xl border border-white/5">
              <ShieldCheck className="text-brand-purple" size={18} />
              <span>Demo Checkout Activated • No real charges apply</span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="glass-card p-8 sticky top-8 border-white/10 h-fit">
            <h3 className="text-xl font-bold mb-6 text-white border-b border-white/5 pb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between text-gray-400 font-medium">
                <span>{quantity}x {tier.name}</span>
                <span className="text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-400 font-medium">
                <span>Processing Fee</span>
                <span className="text-brand-cyan">FREE (Demo)</span>
              </div>
              
              {appliedDiscount && (
                <div className="flex justify-between text-brand-purple font-bold">
                  <span>Discount ({appliedDiscount.discountPercent}%)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="py-4 border-y border-white/5 flex gap-2">
                 <input 
                   placeholder="Discount Code" 
                   value={discountCode}
                   onChange={e => setDiscountCode(e.target.value)}
                   className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full text-xs outline-none text-white uppercase font-bold"
                 />
                 <button onClick={applyDiscount} className="bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple px-4 py-2 rounded-xl text-xs font-bold transition-colors">Apply</button>
              </div>

              <div className="flex justify-between font-black text-2xl text-white pt-2">
                <span>Total</span>
                <span className="text-gradient">₹{total}</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={bookingLoading}
              className="btn-primary w-full py-5 flex items-center justify-center gap-3 text-lg disabled:opacity-50 group"
            >
              {bookingLoading ? <Zap className="animate-spin" /> : (
                <>
                  Pay ₹{total}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-bg flex items-center justify-center"><Zap className="animate-spin text-brand-purple" size={48} /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
