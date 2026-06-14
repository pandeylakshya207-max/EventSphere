import React, { useState, useEffect } from 'react';
import { db, collection, query, where, getDocs, doc, getDoc } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Wishlist() {
  const { profile, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!profile?.wishlist || profile.wishlist.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        const eventPromises = profile.wishlist.map(id => getDoc(doc(db, 'events', id)));
        const eventDocs = await Promise.all(eventPromises);
        const wishlistEvents = eventDocs
          .filter(d => d.exists())
          .map(d => ({ id: d.id, ...d.data() } as Event));
        setEvents(wishlistEvents);
      } catch (error) {
        console.error("Error fetching wishlist events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [profile?.wishlist]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Please Sign In</h1>
        <p className="text-white/60">You need to be signed in to view your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
        </div>
        <div>
          <h1 className="text-4xl font-display">My Wishlist</h1>
          <p className="text-white/60">Events you're interested in</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/event/${event.id}`}>
                <Card className="glass-card h-full flex flex-col group hover:border-white/30 transition-all border-white/10 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.imageUrl || `https://picsum.photos/seed/${event.id}/800/600`} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/50 backdrop-blur-md border-white/10 text-white">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {event.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-white font-medium">
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </div>
                    </div>
                    <h3 className="text-2xl font-display group-hover:text-white transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <p className="text-white/40 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="ghost" className="w-full justify-between group/btn hover:bg-white hover:text-black border border-white/5">
                      View Details
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
          <Heart className="w-16 h-16 mx-auto mb-4 text-white/10" />
          <h2 className="text-xl font-display mb-2">Your wishlist is empty</h2>
          <p className="text-white/40 mb-8 text-sm">Save events you love and they'll appear here.</p>
          <Link to="/">
            <Button className="premium-button">Explore Events</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
