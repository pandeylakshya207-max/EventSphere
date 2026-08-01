// api.ts — Typed client for the real EventSphere backend.
// Replaces the previous src/lib/firebase.ts, which despite its name and
// the presence of firestore.rules in this repo, was NOT connected to
// Firebase at all -- it simulated a database using browser localStorage,
// and "sign in" simply set a role string with no real authentication.
// This file talks to a real Express + SQLite backend with real bcrypt
// password hashing and JWT sessions.

import type { UserProfile, Event, Registration } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'eventsphere_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return body as T;
}

// ─── Auth ───────────────────────────────────────────────────────────────
export async function signup(
  email: string, password: string, displayName: string, role: 'organizer' | 'attendee'
): Promise<UserProfile> {
  const data = await request<{ token: string; user: UserProfile }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, role }),
  });
  setToken(data.token);
  return data.user;
}

export async function login(email: string, password: string): Promise<UserProfile> {
  const data = await request<{ token: string; user: UserProfile }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

export function logout() {
  clearToken();
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!getToken()) return null;
  try {
    return await request<UserProfile>('/api/auth/me');
  } catch {
    clearToken();
    return null;
  }
}

// ─── Events ─────────────────────────────────────────────────────────────
export async function listEvents(limit = 20): Promise<Event[]> {
  return request<Event[]>(`/api/events?limit=${limit}`);
}

export async function getEvent(id: string): Promise<Event> {
  return request<Event>(`/api/events/${id}`);
}

export async function myEvents(): Promise<Event[]> {
  return request<Event[]>('/api/events/mine');
}

export interface CreateEventInput {
  title: string;
  description: string;
  eventDate: string; // ISO string
  location: string;
  category: string;
  imageUrl?: string;
  price: number;
  capacity: number;
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  return request<Event>('/api/events', { method: 'POST', body: JSON.stringify(input) });
}

export async function registerForEvent(eventId: string, ticketCount: number): Promise<Registration> {
  return request<Registration>(`/api/events/${eventId}/register`, {
    method: 'POST',
    body: JSON.stringify({ ticketCount }),
  });
}

// ─── Registrations ──────────────────────────────────────────────────────
export async function myRegistrations(): Promise<Registration[]> {
  return request<Registration[]>('/api/registrations/mine');
}

export async function eventRegistrations(eventId: string): Promise<Registration[]> {
  return request<Registration[]>(`/api/registrations/event/${eventId}`);
}

export async function checkInRegistration(registrationId: string): Promise<Registration> {
  return request<Registration>(`/api/registrations/${registrationId}/checkin`, { method: 'PATCH' });
}

// ─── Wishlist ───────────────────────────────────────────────────────────
export async function getWishlist(): Promise<Event[]> {
  return request<Event[]>('/api/wishlist');
}

export async function toggleWishlist(eventId: string): Promise<{ wishlisted: boolean }> {
  return request<{ wishlisted: boolean }>(`/api/wishlist/${eventId}/toggle`, { method: 'POST' });
}
