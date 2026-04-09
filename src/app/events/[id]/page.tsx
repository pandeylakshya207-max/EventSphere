"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar, MapPin, Clock, Info, 
  ChevronLeft, Share2, ShieldCheck, Zap,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      if (res.ok) {
        setEvent(data);
      } else {
        console.error("Failed to fetch event");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/events/${id}`);
      return;
    }

    if (!selectedTier) {
      toast.error("Please select a ticket tier");
      return;
    }

    // Redirect to the new dedicated Checkout Page instead of doing inline Razorpay
    router.push(`/events/${id}/checkout?tier=${selectedTier.id}`);
  };

  if (loading) return <div className="min-h-screen bg-dark-bg flex items-center justify-center"><Zap className="animate-spin text-brand-purple" size={48} /></div>;
  if (!event) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Event not found</div>;

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1025] to-[#0a0a0a] z-0" />
      <div className="bg-glow absolute inset-0 z-0 opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-28 pb-24">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              router.back();
            } else {
              router.push("/events");
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white mb-10 transition-all duration-200 group px-4 py-2.5 rounded-xl hover:bg-white/8 border border-transparent hover:border-white/10 w-fit cursor-pointer"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-0.5 transition-transform duration-200 text-brand-purple"
          />
          Back to Experiences
        </button>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl shadow-brand-purple/10">
            <img 
              src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000&auto=format&fit=crop"} 
              alt={event.title} 
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000&auto=format&fit=crop" }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80" />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex gap-3 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold uppercase tracking-wider">
                Explore
              </span>
              <span className="px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-bold uppercase tracking-wider">
                {event.category}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight text-white">
              {event.title}
            </h1>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-4 glass-card p-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Calendar className="text-brand-purple" size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Date</div>
                  <div className="text-sm font-bold text-white">{new Date(event.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 glass-card p-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Clock className="text-brand-cyan" size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Time</div>
                  <div className="text-sm font-bold text-white">{event.time}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-400">
              <MapPin size={20} className="text-brand-purple" />
              <span className="text-lg">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Info & Booking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
                <Info className="text-brand-purple" /> About the Event
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                {event.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["Live Performance", "F&B Available", "Premium Seating", "Meet & Greet", "Valet Parking"].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <ShieldCheck size={16} className="text-brand-cyan" />
                    {perk}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="glass-card p-8 sticky top-8 border-brand-purple/30">
              <h3 className="text-xl font-bold mb-6 text-white text-center">Select Your Tier</h3>
              
              <div className="space-y-4 mb-8">
                {event.tiers?.map((tier: any) => (
                  <label key={tier.id} className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedTier?.id === tier.id 
                      ? "border-brand-purple bg-brand-purple/10" 
                      : "border-white/5 bg-white/5 hover:border-white/20"
                  }`}>
                    <input 
                      type="radio" 
                      name="ticket" 
                      className="hidden" 
                      checked={selectedTier?.id === tier.id}
                      onChange={() => setSelectedTier(tier)}
                    />
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-white">{tier.name}</span>
                      <span className="text-brand-cyan font-black">₹{tier.price}</span>
                    </div>
                    <p className="text-xs text-gray-400">{tier.capacity} tickets available</p>
                  </label>
                ))}
              </div>

              <button 
                onClick={handleBooking}
                disabled={bookingLoading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
              >
                {bookingLoading ? <Zap className="animate-spin" /> : <>Book Now <ArrowRight size={20} /></>}
              </button>
              
              <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-[0.2em] font-black">
                Secure Checkout • Powered by EventSphere
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
