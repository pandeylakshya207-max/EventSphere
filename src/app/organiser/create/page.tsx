"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, MapPin, Tag, Image as ImageIcon, 
  Ticket, Info, Clock, ArrowLeft, Loader2, Plus, Trash2 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState([
    { name: "General", price: "0", capacity: "100" }
  ]);

  const addTier = () => {
    setTiers([...tiers, { name: "", price: "", capacity: "" }]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const eventData = {
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      performer: formData.get("performer") as string,
      image: formData.get("image") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      venue: formData.get("venue") as string,
      tiers: tiers.map((tier, i) => ({
        name: (form.querySelectorAll('input[name^="tier-name"]')[i] as HTMLInputElement).value,
        price: (form.querySelectorAll('input[name^="tier-price"]')[i] as HTMLInputElement).value,
        capacity: (form.querySelectorAll('input[name^="tier-qty"]')[i] as HTMLInputElement).value,
      })),
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        toast.success("Experience Launched! 🚀");
        router.push("/organiser");
      } else {
        const error = await res.json();
        toast.error(error.error || "Launch failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-8 relative">
      <div className="bg-glow" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/organiser" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <h1 className="text-4xl font-black mb-2">Create new <span className="text-gradient">Experience</span></h1>
        <p className="text-gray-400 mb-12 text-lg">Fill in the details to launch your event on EventSphere.</p>

        <form onSubmit={handleSubmit} className="space-y-12 pb-24">
          <section className="glass-card p-8 space-y-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Info className="text-brand-purple" size={20} /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Event Title</label>
                <input name="title" required placeholder="e.g. Comedy Night" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Category</label>
                <select name="category" className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-brand-purple text-white">
                  <option className="bg-dark-bg">Standup Comedy</option>
                  <option className="bg-dark-bg">Concert</option>
                  <option className="bg-dark-bg">Tech Meetup</option>
                  <option className="bg-dark-bg">Workshop</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Performer / Speaker</label>
                <input name="performer" placeholder="e.g. John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Upload Photo (URL)</label>
                <input name="image" type="url" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500">Description</label>
              <textarea name="description" rows={4} placeholder="Describe what makes this event special..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple outline-none resize-none" />
            </div>
          </section>

          <section className="glass-card p-8 space-y-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Calendar className="text-brand-cyan" size={20} /> Date & Venue
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Event Date</label>
                <input name="date" required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Time</label>
                <input name="time" required type="time" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500">Venue</label>
              <input name="venue" required placeholder="Physical Address or Online Link" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none" />
            </div>
          </section>

          <section className="glass-card p-8 space-y-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Ticket className="text-brand-cyan" size={20} /> Ticket Tiers
            </h2>
            {tiers.map((tier, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Tier Name</label>
                  <input name={`tier-name-${index}`} required placeholder="General / VIP" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Price (₹)</label>
                  <input name={`tier-price-${index}`} required type="number" placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-grow space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Qty</label>
                    <input name={`tier-qty-${index}`} required type="number" placeholder="100" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none" />
                  </div>
                  {tiers.length > 1 && (
                    <button type="button" onClick={() => removeTier(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg self-end mb-1">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addTier} className="text-xs font-bold text-brand-purple flex items-center gap-1">
              <Plus size={14} /> Add Tier
            </button>
          </section>

          <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl">
            {loading ? <Loader2 className="animate-spin" /> : "Launch Event Live 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}

