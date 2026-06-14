import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, onSnapshot, updateDoc, increment, collection, addDoc, Timestamp, query, where, getDocs } from '../lib/firebase';
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
  const { user, profile, toggleWishlist } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'events', id), (doc) => {
      if (doc.exists()) {
        setEvent({ id: doc.id, ...doc.data() } as Event);
      } else {
        toast.error("Event not found");
        navigate('/');
      }
      setLoading(false);
    });

    if (user && id) {
      const checkRegistration = async () => {
        const q = query(
          collection(db, 'registrations'),
          where('userId', '==', user.uid),
          where('eventId', '==', id)
        );
        const snapshot = await getDocs(q);
        setIsRegistered(!snapshot.empty);
      };
      checkRegistration();
    }

    return () => unsubscribe();
  }, [id, user, navigate]);

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please sign in to register");
      return;
    }
    if (!event || !id) return;
    if (event.ticketsSold >= event.capacity) {
      toast.error("Event is sold out");
      return;
    }

    setRegistering(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        eventId: id,
        eventTitle: event.title,
        eventDate: event.date,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userEmail: user.email || '',
        ticketCount: 1,
        totalPrice: event.price,
        checkedIn: false,
        createdAt: Timestamp.now()
      });
      await updateDoc(doc(db, 'events', id), {
        ticketsSold: increment(1)
      });
      setIsRegistered(true);
      toast.success("Successfully registered for the event!");
    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleWishlist = async () => {
    if (!user || !id) {
      toast.error("Please sign in to wishlist events");
      return;
    }
    try {
      await toggleWishlist(id);
      const isWishlisted = profile?.wishlist?.includes(id);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch (error) {
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
              src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/800`} 
              alt={event.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-white text-black hover:bg-white">{event.category}</Badge>
                  <span className="text-white/40 text-sm">Organized by {event.organizerName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWishlist}
                  className="bg-white/5 border border-white/10 hover:bg-white hover:text-black rounded-full transition-all"
                >
                  <Heart className={`w-5 h-5 ${profile?.wishlist?.includes(id!) ? 'fill-pink-500 text-pink-500' : ''}`} />
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
                      {event.date.toDate().toLocaleDateString('en-US', { 
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
                      {event.capacity - event.ticketsSold} spots remaining
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
                    disabled={registering || event.ticketsSold >= event.capacity}
                    className="w-full premium-button h-12 text-lg"
                  >
                    {registering ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                     event.ticketsSold >= event.capacity ? "Sold Out" : "Get Tickets"}
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
