"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar, MapPin, Clock, Info, 
  ChevronLeft, Share2, ShieldCheck, Zap,
  ArrowRight, Heart, List, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { useEvents } from "@/lib/dummyHooks";
import { createClient } from "@/utils/supabase/client";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: supabaseUser } = useAuth();
  const { wishlist, toggleWishlist } = useEvents();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setEvent(data);
      } else {
        console.error("Event fetch error:", error);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [id]);

  const handleBooking = () => {
    if (!supabaseUser) {
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

        <div className="absolute top-28 right-8 z-20 flex gap-4">
          <button 
            onClick={() => toggleWishlist(id as string)}
            className="glass-card p-3 rounded-full hover:bg-white/10 transition-colors group border-white/10"
          >
             <Heart size={20} className={`transition-colors ${wishlist.includes(id as string) ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-400'}`} />
          </button>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="relative w-full aspect-video overflow-hidden rounded-[2.5rem] border border-white/10 group shadow-2xl shadow-brand-purple/10 bg-white/5">
            <img 
              src={event.image || "/fallback.jpg"} 
              alt={event.title} 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/fallback.jpg";
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex gap-3 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold uppercase tracking-wider">
                Explore
              </span>
              <span className="px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-bold uppercase tracking-wider">
                {event.category}
              </span>
              {event.date === new Date().toISOString().split('T')[0] && (
                 <div className="live-indicator">
                    <div className="live-dot" />
                    Live Now
                 </div>
              )}
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

            {event.agenda && event.agenda.length > 0 && (
              <section>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
                  <List className="text-brand-cyan" /> Event Agenda
                </h2>
                <div className="space-y-4">
                  {event.agenda.map((item: any, i: number) => (
                    <div key={i} className="glass-card p-6 border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="px-4 py-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan font-black text-sm w-fit">
                        {item.time}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                        {item.description && <p className="text-sm text-gray-400">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {event.faq && event.faq.length > 0 && (
              <section>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
                  <HelpCircle className="text-green-400" /> FAQ
                </h2>
                <div className="space-y-4">
                  {event.faq.map((item: any, i: number) => (
                    <div key={i} className="glass-card p-6 border-white/5">
                      <h4 className="text-md font-bold text-white mb-2">{item.question}</h4>
                      <p className="text-sm text-gray-400">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            <section>
               <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
                  <MapPin className="text-pink-400" /> Venue Map
               </h2>
               <div className="w-full h-64 rounded-2xl overflow-hidden glass-card border-white/5 relative">
                  <div className="absolute inset-0 bg-white/5 flex flex-col items-center justify-center text-gray-500">
                     <MapPin size={48} className="mb-4 opacity-50" />
                     <p className="font-bold uppercase tracking-widest text-xs">Map Integration Placeholder</p>
                     <p className="text-xs">{event.venue}</p>
                  </div>
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

