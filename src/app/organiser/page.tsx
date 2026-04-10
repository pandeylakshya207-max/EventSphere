"use client";

import { useEffect, useState } from "react";
import { 
  Users, Ticket, TrendingUp, Plus, 
  Calendar, MapPin, MoreVertical, 
  Edit3, Trash2, Eye, BarChart3,
  Search, Filter
} from "lucide-react";
import Link from "next/link";
import { useEvents } from "@/lib/dummyHooks";

export default function OrganiserDashboard() {
  const { currentUser } = useEvents();
  const user = currentUser;
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events?mine=true");
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ticketsSold = events.reduce((acc, e) => acc + (e.tickets?.length || 0), 0);
  const totalRevenue = events.reduce(
    (acc, e) => acc + (e.tickets?.reduce((tAcc: number, ticket: any) => tAcc + (ticket.tier?.price || 0), 0) || 0), 
  0);
  const totalReach = ticketsSold > 0 ? (ticketsSold * 18).toString() : "0";

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
    { label: "Tickets Sold", value: ticketsSold.toString(), icon: Ticket, color: "text-brand-purple" },
    { label: "Active Events", value: events.length.toString(), icon: Calendar, color: "text-brand-cyan" },
    { label: "Total Reach", value: totalReach, icon: Users, color: "text-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Organiser <span className="text-gradient">Console</span></h1>
            <p className="text-gray-400">Welcome back, {(user as any)?.name || 'Organiser'}</p>
          </div>
          <Link href="/organiser/create" className="btn-primary flex items-center gap-2 self-start md:self-center py-3 px-6">
            <Plus size={20} /> Launch New Experience
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6 border-white/5 group hover:border-brand-purple/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-xs font-bold text-green-400 flex items-center gap-1">+12% <TrendingUp size={12} /></span>
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input type="text" placeholder="Search your experiences..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-purple transition-all" />
          </div>
          <button className="glass-card px-6 py-3 flex items-center gap-2 text-gray-400 hover:text-white border-white/10 transition-all">
            <Filter size={20} /> Filter
          </button>
        </div>

        {/* Events Table/List */}
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Your Experiences</h2>
            <Link href="/events" className="text-sm text-brand-cyan hover:underline">View Live Site</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Experience</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Date & Venue</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Sold</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {events.map((event, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden flex-shrink-0 relative">
                          <div className="absolute inset-0 bg-dark-bg/20 z-10" />
                          <img 
                            src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000&auto=format&fit=crop"} 
                            alt="" 
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=1000&auto=format&fit=crop" }}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white mb-1">{event.title}</div>
                          <div className="text-xs text-gray-500">{event.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white mb-1">{new Date(event.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12} /> {event.venue}</div>
                    </td>
                    <td className="p-4 text-white">
                      {event.tickets?.length || 0} / {event.tiers?.reduce((acc: any, t: any) => acc + t.capacity, 0) || 100}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                        Live
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Eye size={18} /></button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Edit3 size={18} /></button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-red-500/50 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-4">
                        <Calendar size={48} className="opacity-20" />
                        <p>No experiences launched yet. Start by creating your first event!</p>
                        <Link href="/organiser/create" className="text-brand-purple hover:underline">Launch Now</Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

