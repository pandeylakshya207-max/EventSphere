"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Ticket, User, LogOut, LayoutDashboard, PlusCircle, Globe } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-white/5 bg-dark-bg/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-brand-purple/20">
              <Ticket className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">EVENT<span className="text-brand-purple">SPHERE</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/events" className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <Globe size={18} /> Discover
            </Link>
            {session && (
              <>
                <Link href="/tickets" className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Ticket size={18} /> My Tickets
                </Link>
                {(session.user as any).role === "ORGANISER" && (
                  <Link href="/organiser" className="text-sm font-bold text-brand-purple hover:text-brand-cyan transition-colors flex items-center gap-2">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-white leading-none">{session.user?.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{(session.user as any).role}</div>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-500 hover:border-red-500/30 transition-all shadow-xl"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" className="btn-primary py-2.5 px-6 text-sm font-bold">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
