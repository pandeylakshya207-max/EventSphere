export interface TicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;
}

export interface Event {
  id: string;
  title: string;
  performer: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  image: string;
  organizerId: string;
  tiers: TicketTier[];
  createdAt: string;
  price?: number;
  capacity?: number;
  discountCodes?: { code: string; discountPercent: number; expiresAt?: string }[];
  agenda?: { time: string; title: string; description?: string }[];
  faq?: { question: string; answer: string }[];
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  tierId: string;
  qrCode: string;
  status: string;
  createdAt: string;
  checkedIn?: boolean;
  event?: Event;
  tier?: TicketTier;
}

export const mockEvents: Event[] = [
  {
    id: "evt_1",
    title: "Celestial Beats: Midnight Rooftop Rave",
    performer: "DJ Solar & Luna",
    description: "An immersive rooftop experience featuring panoramic city views, high-fidelity sound, and a curated selection of visual arts. Join us for a night where house music meets the stars.",
    date: new Date().toISOString().split('T')[0],
    time: "20:00",
    venue: "Skyline Terrace, Mumbai",
    category: "Music",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop",
    organizerId: "org_1",
    tiers: [
      { id: "tier_1_1", name: "Early Bird", price: 1500, capacity: 50 },
      { id: "tier_1_2", name: "General Admission", price: 2500, capacity: 200 }
    ],
    discountCodes: [
      { code: "HACKATHON20", discountPercent: 20 }
    ],
    agenda: [
      { time: "20:00", title: "Doors Open & Warm-up Set", description: "Grab a drink and vibe to early house tracks." },
      { time: "22:00", title: "DJ Solar (Headliner)", description: "Main set featuring new unreleased tracks." }
    ],
    faq: [
      { question: "Is there parking available?", answer: "Yes, valet parking is available at the venue." },
      { question: "Are drinks included?", answer: "Drinks are standard pay-at-bar unless you purchase VIP." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "evt_2",
    title: "The Laugh Factor: Underground Standup",
    performer: "Aakash Gupta & Friends",
    description: "A raw, intimate standup comedy experience in an undisclosed basement venue. No cameras, no filters, just pure comedy from the country's rising stars.",
    date: "2026-04-20",
    time: "20:00",
    venue: "The Cellar, Bengaluru",
    category: "Standup Comedy",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1600&auto=format&fit=crop",
    organizerId: "org_2",
    tiers: [
      { id: "tier_2_1", name: "Premium Seating", price: 1200, capacity: 40 },
      { id: "tier_2_2", name: "Standing Room", price: 600, capacity: 60 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "evt_3",
    title: "AI & The Metaverse: 2026 Summit",
    performer: "Tech Visionaries Panel",
    description: "A deep dive into the intersection of Generative AI and spatial computing. Featuring hands-on workshops and networking with top engineers and designers.",
    date: "2026-06-10",
    time: "10:00",
    venue: "Innovation Hub, Hyderabad",
    category: "Tech Meetups",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600&auto=format&fit=crop",
    organizerId: "org_3",
    tiers: [
      { id: "tier_3_1", name: "Full Access Pass", price: 5000, capacity: 100 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "evt_4",
    title: "Digital Art Mastery: Procreate Workshop",
    performer: "Elena Rodriguez",
    description: "Learn the secrets of professional digital illustration from an industry veteran. Perfect for intermediate artists looking to level up their workflow.",
    date: "2026-04-25",
    time: "14:00",
    venue: "Studio 44, New Delhi",
    category: "Workshops",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1600&auto=format&fit=crop",
    organizerId: "org_4",
    tiers: [
      { id: "tier_4_1", name: "Workshop Bundle", price: 3500, capacity: 25 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "evt_5",
    title: "Abstract Perspectives: Modern Gallery Night",
    performer: "Emerging Artists Collective",
    description: "An evening dedicated to abstract expressionism. Explore works from 10 featured artists with complimentary wine and atmospheric jazz.",
    date: "2026-05-02",
    time: "19:00",
    venue: "Canvas Gallery, Goa",
    category: "Art & Media",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop",
    organizerId: "org_1",
    tiers: [
      { id: "tier_5_1", name: "Guest List", price: 0, capacity: 100 }
    ],
    createdAt: new Date().toISOString()
  }
];
