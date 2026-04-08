"use client";

import { UserRound, CalendarPlus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChoicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-glow" />
      
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Welcome to <span className="text-gradient">EventSphere</span>
        </h1>
        <p className="text-gray-400 text-lg">What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
        {/* Attendee Option */}
        <div onClick={() => router.push("/events")} className="group cursor-pointer">
          <div className="glass-card p-10 h-full flex flex-col items-center text-center hover:border-brand-cyan transition-all transform hover:-translate-y-2">
            <div className="w-20 h-20 bg-brand-cyan/10 rounded-3xl flex items-center justify-center mb-6 border border-brand-cyan/20 group-hover:scale-110 transition-transform">
              <UserRound size={40} className="text-brand-cyan" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Find an Event</h2>
            <p className="text-gray-400 mb-8">Browse standup comedy, concerts, and tech meetups. Grab your tickets now.</p>
            <div className="mt-auto flex items-center gap-2 text-brand-cyan font-bold uppercase tracking-widest text-sm">
              Explore Events <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* Organiser Option */}
        <div onClick={() => router.push("/organiser")} className="group cursor-pointer">
          <div className="glass-card p-10 h-full flex flex-col items-center text-center hover:border-brand-purple transition-all transform hover:-translate-y-2">
            <div className="w-20 h-20 bg-brand-purple/10 rounded-3xl flex items-center justify-center mb-6 border border-brand-purple/20 group-hover:scale-110 transition-transform">
              <CalendarPlus size={40} className="text-brand-purple" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Host an Event</h2>
            <p className="text-gray-400 mb-8">Create your own event, manage tickets, and track registrations with ease.</p>
            <div className="mt-auto flex items-center gap-2 text-brand-purple font-bold uppercase tracking-widest text-sm">
              Create Dashboard <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
