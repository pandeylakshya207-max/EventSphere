import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../lib/api';
import { UserProfile, Event } from '../types';

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  isOrganizer: boolean;
  wishlist: Event[];
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (eventId: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, role: 'organizer' | 'attendee') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  isOrganizer: false,
  wishlist: [],
  refreshWishlist: async () => {},
  toggleWishlist: async () => {},
  signup: async () => {},
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wishlist, setWishlist] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWishlist = async () => {
    if (!profile) {
      setWishlist([]);
      return;
    }
    try {
      setWishlist(await api.getWishlist());
    } catch {
      setWishlist([]);
    }
  };

  const toggleWishlist = async (eventId: string) => {
    if (!profile) return;
    await api.toggleWishlist(eventId);
    await refreshWishlist();
  };

  const signup = async (email: string, password: string, displayName: string, role: 'organizer' | 'attendee') => {
    const user = await api.signup(email, password, displayName, role);
    setProfile(user);
  };

  const login = async (email: string, password: string) => {
    const user = await api.login(email, password);
    setProfile(user);
  };

  const logout = () => {
    api.logout();
    setProfile(null);
    setWishlist([]);
  };

  useEffect(() => {
    (async () => {
      const user = await api.getCurrentUser();
      setProfile(user);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    refreshWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  return (
    <AuthContext.Provider value={{
      profile, loading, isOrganizer: profile?.role === 'organizer',
      wishlist, refreshWishlist, toggleWishlist, signup, login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
