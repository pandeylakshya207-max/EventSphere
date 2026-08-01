import { useState, useEffect } from 'react';
import * as api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Event, Registration } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Ticket, CheckCircle2, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const Dashboard = () => {
  const { profile, isOrganizer } = useAuth();
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    if (!profile) return;

    if (isOrganizer) {
      api.myEvents().then(setOrganizedEvents).catch(() => {});
    } else {
      api.myRegistrations().then(setRegistrations).catch(() => {});
    }
  }, [profile, isOrganizer]);

  if (!profile) return <div className="text-center py-20">Please sign in to view your dashboard.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-5xl font-display">Dashboard</h1>
          <p className="text-white/40 mt-2">Welcome back, {profile.displayName}</p>
        </div>
        <Badge variant="outline" className="w-fit border-white/10 text-white/60 px-3 py-1">
          {isOrganizer ? 'Organizer Account' : 'Attendee Account'}
        </Badge>
      </div>

      <Tabs defaultValue={isOrganizer ? "organized" : "tickets"} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          {isOrganizer && (
            <TabsTrigger value="organized" className="data-[state=active]:bg-white data-[state=active]:text-black">
              My Events
            </TabsTrigger>
          )}
          {!isOrganizer && (
            <TabsTrigger value="tickets" className="data-[state=active]:bg-white data-[state=active]:text-black">
              My Tickets
            </TabsTrigger>
          )}
        </TabsList>

        {isOrganizer && (
          <TabsContent value="organized" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {organizedEvents.length > 0 ? (
                organizedEvents.map(event => (
                  <Link key={event.id} to={`/event/${event.id}`}>
                    <Card className="glass-card hover:border-white/30 transition-all border-white/10">
                      <CardContent className="p-6 flex gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={event.image_url || `https://picsum.photos/seed/${event.id}/200/200`}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                          <h3 className="text-xl font-display truncate">{event.title}</h3>
                          <div className="flex items-center gap-4 text-white/40 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(event.event_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.tickets_sold} sold
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12 border border-dashed border-white/10 rounded-2xl text-white/30">
                  You haven't organized any events yet.
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {!isOrganizer && (
          <TabsContent value="tickets" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.length > 0 ? (
                registrations.map(reg => (
                  <Card key={reg.id} className="glass-card border-white/10 overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-display truncate">{reg.event_title}</CardTitle>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/40">
                          {reg.event_date && new Date(reg.event_date).toLocaleDateString()}
                        </p>
                        {reg.checked_in ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5 h-5">
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-white/40 border-white/10 text-[10px] px-1.5 h-5">
                            Valid
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-wider">Tickets</p>
                          <p className="font-medium">{reg.ticket_count}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white hover:text-black">
                                <QrCode className="w-4 h-4" />
                                View Ticket
                              </Button>
                            }
                          />
                          <DialogContent className="glass-card border-white/10 text-white max-w-xs">
                            <DialogHeader>
                              <DialogTitle className="text-center font-display">{reg.event_title}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-6 py-6">
                              <div className="p-4 bg-white rounded-2xl">
                                <QRCodeCanvas
                                  value={reg.id}
                                  size={200}
                                  level="H"
                                  includeMargin={true}
                                />
                              </div>
                              <div className="text-center space-y-1">
                                <p className="text-sm font-medium">{profile.displayName}</p>
                                <p className="text-xs text-white/40">Ticket ID: {reg.id}</p>
                              </div>
                              {!!reg.checked_in && (
                                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-full text-sm">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Checked In
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 border border-dashed border-white/10 rounded-2xl text-white/30">
                  <Ticket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>You haven't registered for any events yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
