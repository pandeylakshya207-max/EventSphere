"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Ticket,
  User,
  LogOut,
  Globe,
  Menu,
  X,
  Plus,
  LayoutDashboard,
  Settings,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const isAuthPage = pathname === "/auth/signin" || pathname === "/auth/signup";

  /* ── Scroll listener ─────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close menu/dropdown on route change ───────────── */
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  /* ── Close dropdown on click outside ──────────────── */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Keyboard Support ─────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { href: "/events", label: "Discover", icon: Globe },
    ...(isLoggedIn
      ? [
        { href: "/create-event", label: "Host Event", icon: Plus },
        { href: "/tickets", label: "My Tickets", icon: Ticket },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ]
      : []),
  ];

  return (
    <>
      <nav
        className={[
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "h-14 bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40"
            : "h-16 md:h-20 bg-transparent border-b border-transparent",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div
              className={[
                "bg-gradient-to-br from-brand-purple to-brand-cyan rounded-xl flex items-center justify-center",
                scrolled ? "w-8 h-8" : "w-9 h-9 md:w-10 md:h-10",
              ].join(" ")}
            >
              <Ticket className="text-white" size={scrolled ? 16 : 18} />
            </div>

            <span className="font-black text-white tracking-tight uppercase text-lg md:text-2xl">
              Event<span className="text-brand-purple">Sphere</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthPage && navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-3">

            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Trigger */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onKeyDown={(e) => e.key === "Enter" && setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-purple/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purple-light text-sm font-bold shadow-inner">
                    {user?.email?.[0]?.toUpperCase() ?? <User size={14} />}
                  </div>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Account Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 glass-card p-2 border-white/10 shadow-2xl z-50 origin-top-right overflow-hidden"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-white/5 mb-2 bg-white/5 rounded-t-lg">
                        <div className="font-black text-white text-sm line-clamp-1">{user?.user_metadata?.full_name || user?.email}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                          <ShieldCheck size={10} className="text-brand-cyan" />
                          {user?.user_metadata?.role || "Explorer"}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1">
                        <Link 
                          href="/account" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                        >
                          <User size={16} className="group-hover:text-brand-purple transition-colors" />
                          View Profile
                        </Link>
                        <Link 
                          href="/dashboard" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                        >
                          <Settings size={16} className="group-hover:text-brand-cyan transition-colors" />
                          Organiser Hub
                        </Link>
                        
                        <div className="h-px bg-white/5 my-2" />
                        
                        <button
                          onClick={() => {
                            signOut();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              !isAuthPage && (
                <Link
                  href="/auth/signin"
                  className="px-3 py-1.5 md:px-5 md:py-2 text-sm rounded-lg bg-brand-purple text-white font-semibold transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  Sign In
                </Link>
              )
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-14 z-40 md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden shadow-2xl"
          >
            <div className="p-6 space-y-6">
              {/* User Section Mobile */}
              {isLoggedIn && (
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple-light text-lg font-black">
                      {user?.email?.[0]?.toUpperCase()}
                   </div>
                   <div>
                      <div className="font-bold text-white">{user?.user_metadata?.full_name || user?.email}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                   </div>
                </div>
              )}

              {/* Links */}
              <div className="grid grid-cols-1 gap-2">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Icon size={20} className="text-brand-cyan" />
                    {label}
                  </Link>
                ))}
              </div>

              {isLoggedIn && (
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-bold text-gray-400 hover:text-white transition-all"
                  >
                    <User size={20} />
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              )}

              {!isLoggedIn && (
                <Link
                  href="/auth/signin"
                  className="block w-full text-center py-4 rounded-2xl bg-brand-purple text-white font-black uppercase tracking-widest shadow-lg shadow-brand-purple/30"
                >
                  Join EventSphere
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky CTA */}
      {isLoggedIn && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
          <Link
            href="/create-event"
            className="flex items-center justify-center gap-3 bg-brand-purple text-white py-4 rounded-2xl shadow-2xl shadow-brand-purple/40 font-black uppercase tracking-widest text-xs border border-white/10"
          >
            <Plus size={20} />
            Create Event
          </Link>
        </div>
      )}
    </>
  );
}

