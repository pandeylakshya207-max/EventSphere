import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../lib/api';
import { Event } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, ArrowLeft, Loader2, CheckCircle2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, toggleWishlist, wishlist } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const wishlisted = wishlist.some(e => e.id === id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getEvent(id)
      .then(setEvent)
      .catch(() => {
        toast.error("Event not found");
        navigate('/');
      })
      .finally(() => setLoading(false));

    if (profile) {
      api.myRegistrations()
        .then(regs => setIsRegistered(regs.some(r => r.event_id === id)))
        .catch(() => {});
    }
  }, [id, profile, navigate]);

  const handleRegister = async () => {
    if (!profile) {
      toast.error("Please sign in to register");
      return;
    }
    if (!event || !id) return;

    setRegistering(true);
    try {
      await api.registerForEvent(id, 1);
      setIsRegistered(true);
      // Refresh event to get the real updated tickets_sold from the server
      // (the backend, not this client, is the source of truth for capacity)
      const updated = await api.getEvent(id);
      setEvent(updated);
      toast.success("Successfully registered for the event!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleWishlist = async () => {
    if (!profile || !id) {
      toast.error("Please sign in to wishlist events");
      return;
    }
    try {
      const wasWishlisted = wishlisted;
      await toggleWishlist(id);
      toast.success(wasWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-white/50" />
    </div>
  );

  if (!event) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="text-white/50 hover:text-white gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-video rounded-3xl overflow-hidden border border-white/10"
          >
            <img
              src={event.image_url || `https://picsum.photos/seed/${event.id}/1200/800`}
              alt={event.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-white text-black hover:bg-white">{event.category}</Badge>
                <span className="text-white/40 text-sm">Organized by {event.organizer_name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWishlist}
                className="bg-white/5 border border-white/10 hover:bg-white hover:text-black rounded-full transition-all"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />
              </Button>
            </div>
            <h1 className="text-5xl md:text-6xl font-display">{event.title}</h1>
            <p className="text-white/70 text-lg leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-card sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-white/50 mt-1" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-white/50 text-sm">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-white/50 mt-1" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-white/50 text-sm">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-white/50 mt-1" />
                  <div>
                    <p className="font-medium">Availability</p>
                    <p className="text-white/50 text-sm">
                      {event.capacity - event.tickets_sold} spots remaining
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/50">Price</span>
                  <span className="text-3xl font-display">${event.price}</span>
                </div>

                {isRegistered ? (
                  <Button className="w-full bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 gap-2 cursor-default">
                    <CheckCircle2 className="w-5 h-5" />
                    Registered
                  </Button>
                ) : (
                  <Button
                    onClick={handleRegister}
                    disabled={registering || event.tickets_sold >= event.capacity}
                    className="w-full premium-button h-12 text-lg"
                  >
                    {registering ? <Loader2 className="w-5 h-5 animate-spin" /> :
                     event.tickets_sold >= event.capacity ? "Sold Out" : "Get Tickets"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
