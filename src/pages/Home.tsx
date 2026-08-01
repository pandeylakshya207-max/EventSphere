import React, { useState, useEffect } from 'react';
import * as api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Heart, Sparkles, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Home = () => {
  const { profile, toggleWishlist, wishlist, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.listEvents(10)
      .then(setEvents)
      .catch((err) => console.error('Error loading events:', err))
      .finally(() => setLoading(false));
  }, [profile]);

  const wishlistIds = new Set(wishlist.map(e => e.id));

  const handleWishlist = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile) {
      toast.error("Please sign in to wishlist events");
      return;
    }
    try {
      const wasWishlisted = wishlistIds.has(eventId);
      await toggleWishlist(eventId);
      toast.success(wasWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  // 1. Guest/Not Logged In view
  if (!profile) {
    return (
      <div className="space-y-16 pb-12">
        <section className="text-center space-y-8 py-16 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-mono tracking-wider mb-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            DISCOVER THE EXTRAORDINARY
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-display leading-[1.1] tracking-tight"
          >
            Your Private Gateway to <span className="italic text-white/50 block md:inline">Unforgettable</span> Moments
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Browse curated local events, claim exclusive gold-tier tickets, and manage effortless check-ins in one unified space.
            <span className="block mt-2 text-white/40">Sign in or create an account to explore the calendar.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-6"
          >
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-white/90 text-black font-medium text-lg px-8 py-6 rounded-full inline-flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Sign In to Browse Events
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 pt-4">
          <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display">Instant Booking</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Reserve tickets for exclusive local technology, music, art, culinary, wellness, and adventure gatherings instantaneously.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display">Curated Calendar</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Ditch the noise. Browse high-quality experiences vetted by our premium organizers specially for enthusiasts.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-display">E-Ticket Check-In</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Receive your custom entry pass within seconds. Present your badge, scan, and start enjoying the experience.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // 2. Organizer view
  if (isOrganizer) {
    return (
      <div className="max-w-4xl mx-auto py-16 space-y-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display">Hello, {profile.displayName}!</h1>
        <p className="text-white/60 text-lg max-w-xl">
          You're signed in as an organizer. Create a new event or manage your existing ones from your console below.
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link to="/create">
            <Button className="bg-white hover:bg-white/95 text-black rounded-full px-6 py-5 inline-flex items-center gap-2">
              Create New Event
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="border-white/10 text-white rounded-full px-6 py-5">
              Go to Creator Console
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Attendee view
  return (
    <div className="space-y-12">
      <section className="space-y-4 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-display">
          Welcome back, <span className="text-white/60 italic">{profile.displayName}</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl">
          Discover handpicked local experiences and secure your reservations. Use your dashboard to view booked tickets.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-[400px] rounded-2xl bg-white/5 animate-pulse" />
          ))
        ) : events.length > 0 ? (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/event/${event.id}`}>
                <Card className="glass-card overflow-hidden group hover:border-white/30 transition-all duration-500">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={event.image_url || `https://picsum.photos/seed/${event.id}/800/450`}
                      alt={event.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white text-black hover:bg-white">{event.category}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black rounded-full transition-all"
                      onClick={(e) => handleWishlist(e, event.id)}
                    >
                      <Heart
                        className={`w-4 h-4 ${wishlistIds.has(event.id) ? 'fill-pink-500 text-pink-500' : ''}`}
                      />
                    </Button>
                  </div>
                  <CardHeader className="space-y-1">
                    <h3 className="text-2xl font-display line-clamp-1">{event.title}</h3>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-white/50 text-sm line-clamp-1">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {event.location}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Users className="w-4 h-4" />
                      {event.tickets_sold} / {event.capacity}
                    </div>
                    <span className="text-xl font-display">${event.price}</span>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-white/40">
            No events found. Be the first to create one!
          </div>
        )}
      </section>
    </div>
  );
};
