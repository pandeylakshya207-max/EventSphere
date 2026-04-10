"use client";

import { useEffect, useState } from "react";
import { 
  Users, Calendar, AlertTriangle, CheckCircle, 
  XCircle, Filter, Search, BarChart3,
  Settings, ShieldAlert
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.user_metadata?.role !== "ADMIN" && user.email !== "admin@eventsphere.com") {
      // For demo, we allow admin@eventsphere.com
      // router.push("/"); 
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (res.ok) setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (id: string) => {
    alert("Event Approved");
  };

  const rejectEvent = async (id: string) => {
    alert("Event Rejected");
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-4">
              <ShieldAlert className="text-red-500" size={40} />
              Admin <span className="text-gradient">Control</span>
            </h1>
            <p className="text-gray-400 mt-2">Global oversight and moderation</p>
          </div>
          <div className="flex gap-4">
            <button className="glass-card px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">System Logs</button>
            <button className="glass-card px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Settings</button>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border-white/5">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">Pending Approval</div>
            <div className="text-3xl font-black text-yellow-500">3</div>
          </div>
          <div className="glass-card p-6 border-white/5">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">Total Users</div>
            <div className="text-3xl font-black text-brand-cyan">1,204</div>
          </div>
          <div className="glass-card p-6 border-white/5">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">Global Revenue</div>
            <div className="text-3xl font-black text-green-500">₹8,42,000</div>
          </div>
        </div>

        {/* Event Moderation Table */}
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="font-bold text-white uppercase tracking-widest text-sm">Event Moderation</h2>
            <div className="flex gap-2">
               <button className="p-2 bg-white/5 rounded-lg text-gray-400"><Search size={16} /></button>
               <button className="p-2 bg-white/5 rounded-lg text-gray-400"><Filter size={16} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter border-b border-white/5">
                    <th className="p-4">Event</th>
                    <th className="p-4">Organiser</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{event.title}</div>
                        <div className="text-xs text-gray-500">{event.category}</div>
                      </td>
                      <td className="p-4 text-gray-400">
                        {event.organizerId}
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(event.date).toDateString()}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded uppercase">Pending</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => approveEvent(event.id)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"><CheckCircle size={18} /></button>
                          <button onClick={() => rejectEvent(event.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"><XCircle size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}

