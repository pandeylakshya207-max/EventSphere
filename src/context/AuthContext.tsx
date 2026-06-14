import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, doc, getDoc, setDoc, Timestamp, onAuthStateChanged, User } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isOrganizer: boolean;
  toggleWishlist: (eventId: string) => Promise<void>;
  mockLogin: (role: 'organizer' | 'attendee') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isOrganizer: false,
  toggleWishlist: async () => {},
  mockLogin: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const toggleWishlist = async (eventId: string) => {
    if (!user || !profile) return;
    const newWishlist = profile.wishlist?.includes(eventId)
      ? profile.wishlist.filter(id => id !== eventId)
      : [...(profile.wishlist || []), eventId];
    
    await setDoc(doc(db, 'users', user.uid), { wishlist: newWishlist }, { merge: true });
    setProfile({ ...profile, wishlist: newWishlist });
  };

  const mockLogin = (role: 'organizer' | 'attendee') => {
    const mockUser = {
      uid: `mock-${role}`,
      displayName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@demo.local`,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
    } as User;

    const mockProfile: UserProfile = {
      uid: mockUser.uid,
      displayName: mockUser.displayName!,
      email: mockUser.email!,
      photoURL: mockUser.photoURL,
      role: role,
      wishlist: [],
      createdAt: Timestamp.now(),
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);
    localStorage.setItem('mock_user_role', role);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          // Determine role for demo users or default to attendee
          let role: 'organizer' | 'attendee' = 'attendee';
          if (user.email === 'organizer@demo.com' || user.uid.includes('organizer')) role = 'organizer';
          
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || (role === 'organizer' ? 'Demo Organizer' : 'Demo Attendee'),
            email: user.email,
            photoURL: user.photoURL,
            role: role,
            wishlist: [],
            createdAt: Timestamp.now(),
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isOrganizer: profile?.role === 'organizer', toggleWishlist, mockLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
