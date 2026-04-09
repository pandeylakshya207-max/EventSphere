"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft, Zap, ShieldCheck, Plus, Minus } from "lucide-react";
import { useEvents } from "@/context/EventContext";

export default function CheckoutPage() {
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

  const handlePayment = async () => {
    if (!tier) return;
    setBookingLoading(true);

    try {
      // 1. Simulate Booking directly in context
      const newTickets = bookTicket(
        id as string, 
        tier.id, 
        (session?.user as any).id || "demo_user", 
        quantity
      );

      toast.success(`Demo payment successful! ${quantity} ticket(s) generated.`);
      router.push(`/tickets/${newTickets[0].id}`);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong during checkout");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><Zap className="animate-spin text-brand-purple" size={48} /></div>;
  if (!event || !tier) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Event or Tier not found</div>;

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-12 relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1025] to-[#0a0a0a] z-0" />
      <div className="bg-glow absolute inset-0 z-0 opacity-50" />
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
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
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
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-dark-bg/20 z-10" />
                  <img 
                    src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000&auto=format&fit=crop"} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000&auto=format&fit=crop" }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{event.title}</h3>
                  <p className="text-sm text-brand-cyan">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="text-gray-300">
                  <span className="font-bold block text-white">{tier.name} Ticket</span>
                  <span className="text-xs">₹{tier.price} per ticket</span>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:bg-white/10 rounded-lg text-white"><Minus size={16} /></button>
                  <span className="font-bold w-6 text-center text-white">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="p-1 hover:bg-white/10 rounded-lg text-white"><Plus size={16} /></button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400">
              <ShieldCheck className="text-brand-purple" size={20} />
              <span>Demo Mode: Tickets are generated instantly for preview purposes.</span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="glass-card p-8 sticky top-8 border-white/10 h-fit">
            <h3 className="text-xl font-bold mb-6 text-white border-b border-white/5 pb-4">Order Summary (Demo)</h3>
            
            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>{quantity}x {tier.name}</span>
                <span>₹{tier.price * quantity}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Processing Fee</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between font-black text-xl text-white pt-4 border-t border-white/5">
                <span>Total</span>
                <span className="text-brand-cyan">₹{tier.price * quantity}</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={bookingLoading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
            >
              {bookingLoading ? <Zap className="animate-spin" /> : `Pay ₹${tier.price * quantity}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
