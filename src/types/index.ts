import { Timestamp } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'organizer' | 'attendee';
  wishlist?: string[];
  createdAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  location: string;
  category: string;
  imageUrl?: string;
  organizerId: string;
  organizerName: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  createdAt: Timestamp;
}

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: Timestamp;
  userId: string;
  userName: string;
  userEmail: string;
  ticketCount: number;
  totalPrice: number;
  checkedIn: boolean;
  checkInTime?: Timestamp;
  createdAt: Timestamp;
}
