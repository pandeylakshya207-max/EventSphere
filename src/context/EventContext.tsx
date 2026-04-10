"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Event, Ticket, mockEvents } from "@/lib/mockData";

interface EventContextType {
  events: Event[];
  tickets: Ticket[];
  addEvent: (event: Omit<Event, "id" | "createdAt" | "organizerId">) => Event;
  getEventById: (id: string) => Event | undefined;
  getSurpriseEvent: () => Event | undefined;
  bookTicket: (eventId: string, tierId: string, userId: string, quantity: number) => Ticket[];
  getTicketsByUserId: (userId: string) => Ticket[];
  getTicketById: (id: string) => Ticket | undefined;
  getEventsByOrganizerId: (userId: string) => Event[];
  wishlist: string[];
  toggleWishlist: (eventId: string) => void;
  checkInTicket: (ticketId: string) => boolean;
  currentUser: any | null;
  login: (user: any) => void;
  logout: () => void;
  updateUser: (data: any) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const storedEvents = localStorage.getItem("es_events");
    const storedTickets = localStorage.getItem("es_tickets");
    const storedWishlist = localStorage.getItem("es_wishlist");
    const storedUser = localStorage.getItem("es_user");

    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      setEvents(mockEvents);
    }

    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    }
    
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }

    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    setInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (initialized) {
      localStorage.setItem("es_events", JSON.stringify(events));
      localStorage.setItem("es_tickets", JSON.stringify(tickets));
      localStorage.setItem("es_wishlist", JSON.stringify(wishlist));
      if (currentUser) {
        localStorage.setItem("es_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("es_user");
      }
    }
  }, [events, tickets, wishlist, currentUser, initialized]);

  const login = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem("es_user", JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("es_user");
  };

  const updateUser = (data: any) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
      localStorage.setItem("es_user", JSON.stringify(updated));
    }
  };

  const addEvent = (eventData: Omit<Event, "id" | "createdAt" | "organizerId">) => {
    const newEvent: Event = {
      ...eventData,
      id: `evt_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      organizerId: "demo_user_id" // Use a static ID for demo
    };
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const getEventById = (id: string) => {
    return events.find(e => e.id === id);
  };

  const bookTicket = (eventId: string, tierId: string, userId: string, quantity: number) => {
    const event = getEventById(eventId);
    const tier = event?.tiers.find(t => t.id === tierId);
    
    if (!event || !tier) throw new Error("Event or Tier not found");

    const newTickets: Ticket[] = [];
    for (let i = 0; i < quantity; i++) {
        const ticket: Ticket = {
            id: `tic_${Math.random().toString(36).substring(2, 9)}`,
            eventId,
            userId,
            tierId,
            qrCode: `QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            status: "PAID",
            createdAt: new Date().toISOString(),
            event,
            tier
          };
          newTickets.push(ticket);
    }
    
    setTickets(prev => [...newTickets, ...prev]);
    return newTickets;
  };

  const getTicketsByUserId = (userId: string) => {
    return tickets.filter(t => t.userId === userId);
  };

  const getTicketById = (id: string) => {
      const ticket = tickets.find(t => t.id === id);
      if (ticket && !ticket.event) {
          // Re-attach relations if lost in storage
          ticket.event = getEventById(ticket.eventId);
          ticket.tier = ticket.event?.tiers.find(tier => tier.id === ticket.tierId);
      }
      return ticket;
  };

  const getSurpriseEvent = () => {
    if (events.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];
  };

  const getEventsByOrganizerId = (userId: string) => {
    return events.filter(e => e.organizerId === userId);
  };

  const toggleWishlist = (eventId: string) => {
    setWishlist(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const checkInTicket = (ticketId: string) => {
    let success = false;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId || t.qrCode === ticketId) {
        success = true;
        return { ...t, checkedIn: true };
      }
      return t;
    }));
    return success;
  };

  return (
    <EventContext.Provider value={{ 
        events, 
        tickets, 
        addEvent, 
        getEventById, 
        getSurpriseEvent,
        bookTicket, 
        getTicketsByUserId,
        getTicketById,
        getEventsByOrganizerId,
        wishlist,
        toggleWishlist,
        checkInTicket,
        currentUser,
        login,
        logout,
        updateUser
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}
