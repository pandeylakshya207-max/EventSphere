import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout, loginDemoUser } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Plus, LogOut, LayoutDashboard, Heart, ScanLine, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export const Navbar = () => {
  const { user, profile, isOrganizer } = useAuth();
  const [showDemo, setShowDemo] = useState(false);

  const handleDemoSignIn = async (role: 'organizer' | 'attendee') => {
    try {
      const user = await loginDemoUser(role);
      if (user) {
        toast.success(`Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`);
        setShowDemo(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload(); // Force reload to clear all states
  };

  return (
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar className="text-black w-6 h-6" />
          </div>
          <span className="text-xl font-display tracking-tight">EventSphere</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isOrganizer && (
                <>
                  <Link to="/create">
                    <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-white/70 hover:text-white">
                      <Plus className="w-4 h-4" />
                      Create
                    </Button>
                  </Link>
                  <Link to="/check-in">
                    <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-white/70 hover:text-white">
                      <ScanLine className="w-4 h-4" />
                      Check-in
                    </Button>
                  </Link>
                </>
              )}
              {!isOrganizer && (
                <Link to="/wishlist">
                  <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-white/70 hover:text-white">
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-white/70 hover:text-white">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <Avatar className="w-8 h-8 border border-white/20">
                  <AvatarImage src={user.photoURL || ''} />
                  <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white/50 hover:text-white animate-fade-in">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDemo(!showDemo)}
                  className="border-white/10 text-white hover:text-black hover:bg-white gap-2 transition-all"
                >
                  <UserCircle className="w-4 h-4" />
                  Sign In
                </Button>
                
                {showDemo && (
                  <div className="absolute top-full right-0 mt-2 w-48 glass-card p-2 space-y-1 z-50">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:bg-white/10 gap-2 text-xs"
                      onClick={() => handleDemoSignIn('organizer')}
                    >
                      Demo Organizer
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start hover:bg-white/10 gap-2 text-xs"
                      onClick={() => handleDemoSignIn('attendee')}
                    >
                      Demo Attendee
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
