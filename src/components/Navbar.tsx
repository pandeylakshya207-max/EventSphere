import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Plus, LogOut, LayoutDashboard, Heart, ScanLine, UserCircle } from 'lucide-react';

export const Navbar = () => {
  const { profile, isOrganizer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
          {profile ? (
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
                  <AvatarImage src={profile.photoUrl || ''} />
                  <AvatarFallback>{profile.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white/50 hover:text-white">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:text-black hover:bg-white gap-2 transition-all"
              >
                <UserCircle className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
