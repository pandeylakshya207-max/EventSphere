"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Ticket, User, LogOut, LayoutDashboard, Globe, Menu, X,
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
          { href: "/tickets", label: "My Tickets", icon: Ticket },
          ...((session.user as any).role === "ORGANISER"
            ? [{ href: "/organiser", label: "Dashboard", icon: LayoutDashboard }]
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
            : "h-20 bg-transparent border-b border-transparent",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* ── Logo ──────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div
              className={[
                "bg-gradient-to-br from-brand-purple to-brand-cyan rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-brand-purple/20",
                scrolled ? "w-8 h-8" : "w-10 h-10",
              ].join(" ")}
            >
              <Ticket
                className="text-white transition-all duration-300"
                size={scrolled ? 18 : 22}
              />
            </div>
            <span
              className={[
                "font-black text-white tracking-tighter uppercase transition-all duration-300",
                scrolled ? "text-xl" : "text-2xl",
              ].join(" ")}
            >
              Event<span className="text-brand-purple text-glow">Sphere</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────── */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <Icon
                  size={16}
                  className="text-gray-500 group-hover:text-brand-purple transition-colors"
                />
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right side ────────────────────────────── */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                {/* User info — desktop only */}
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-white leading-none">
                    {session.user?.name}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                    {(session.user as any).role}
                  </div>
                </div>

                {/* Avatar bubble */}
                <div className="w-9 h-9 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple-light font-black text-sm flex-shrink-0">
                  {session.user?.name?.[0]?.toUpperCase() ?? <User size={16} />}
                </div>

                {/* Sign out */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden md:flex p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" className="btn-primary py-2 px-5 text-sm">
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Drawer ───────────────────────────── */}
      <div
        className={[
          "fixed inset-x-0 z-40 md:hidden transition-all duration-300 ease-in-out",
          mobileOpen
            ? "top-14 opacity-100 pointer-events-auto"
            : "top-14 opacity-0 pointer-events-none -translate-y-2",
        ].join(" ")}
      >
        <div className="mx-4 mt-2 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/60">
          <div className="p-4 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Icon size={18} className="text-brand-purple" />
                {label}
              </Link>
            ))}

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all mt-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            )}

            {!session && (
              <div className="pt-2">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
