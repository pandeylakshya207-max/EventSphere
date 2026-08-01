// Real data types matching the backend's actual response shapes.
// Dates are ISO 8601 strings (as returned by SQLite's datetime('now') and
// the events.event_date column) -- no more fake Firestore Timestamp class.

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  role: 'organizer' | 'attendee';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string; // ISO string
  location: string;
  category: string;
  image_url?: string | null;
  organizer_id: string;
  organizer_name: string;
  price: number;
  capacity: number;
  tickets_sold: number;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  ticket_count: number;
  total_price: number;
  checked_in: number; // SQLite stores booleans as 0/1
  check_in_time: string | null;
  created_at: string;
  // Present on GET /registrations/mine (joined with event data):
  event_title?: string;
  event_date?: string;
  location?: string;
  // Present on GET /registrations/event/:id (joined with user data):
  user_name?: string;
  user_email?: string;
}
