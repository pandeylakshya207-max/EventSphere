"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Ticket,
  User,
  LogOut,
  LayoutDashboard,
  Globe,
  Menu,
  X,
  Plus, // ✅ FIXED IMPORT
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── Scroll listener ─────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close mobile menu on route change ───────────── */
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  const navLinks = [
    { href: "/events", label: "Discover", icon: Globe },
    ...(session
      ? [
        { href: "/create-event", label: "Host Event", icon: Plus },
        { href: "/tickets", label: "My Tickets", icon: Ticket },
        ...((session.user as any).role === "ORGANISER"
          ? [
            {
              href: "/organiser",
              label: "Dashboard",
              icon: LayoutDashboard,
            },
          ]
          : []),
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

          {/* ── Logo ───────────────── */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div
              className={[
                "bg-gradient-to-br from-brand-purple to-brand-cyan rounded-xl flex items-center justify-center transition-all duration-500",
                scrolled ? "w-8 h-8" : "w-9 h-9 md:w-10 md:h-10",
              ].join(" ")}
            >
              <Ticket
                className="text-white"
                size={scrolled ? 16 : 18}
              />
            </div>

            <span
              className={[
                "font-black text-white tracking-tight uppercase",
                "text-lg md:text-2xl",
              ].join(" ")}
            >
              Event<span className="text-brand-purple">Sphere</span>
            </span>
          </Link>

          {/* ── Desktop Nav ───────── */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-semibold text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right Side ───────── */}
          <div className="flex items-center gap-2 md:gap-3">

            {session ? (
              <>
                {/* Avatar */}
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple-light text-sm font-bold">
                  {session.user?.name?.[0]?.toUpperCase() ?? (
                    <User size={14} />
                  )}
                </div>

                {/* Logout */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden md:flex p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 transition"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-3 py-1.5 md:px-5 md:py-2 text-sm rounded-lg bg-brand-purple text-white font-semibold"
              >
                Sign In
              </Link>
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

      {/* ── Mobile Drawer ───────── */}
      <div
        className={[
          "fixed inset-x-0 z-40 md:hidden transition-all duration-300",
          mobileOpen
            ? "top-14 opacity-100"
            : "top-14 opacity-0 pointer-events-none -translate-y-2",
        ].join(" ")}
      >
        <div className="mx-4 mt-2 rounded-xl bg-black/90 border border-white/10 shadow-lg">
          <div className="p-3 space-y-1">

            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10"
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-400"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            )}

            {!session && (
              <Link
                href="/auth/signin"
                className="block w-full text-center mt-2 px-4 py-2 rounded-lg bg-brand-purple text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 MOBILE FIXED CTA (BIG UX BOOST) */}
      {session && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
          <Link
            href="/create-event"
            className="flex items-center justify-center gap-2 bg-brand-purple text-white py-3 rounded-xl shadow-lg"
          >
            <Plus size={18} />
            Host Event
          </Link>
        </div>
      )}
    </>
  );
}