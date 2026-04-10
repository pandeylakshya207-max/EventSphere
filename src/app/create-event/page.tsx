"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, MapPin, Tag, Image as ImageIcon, 
  Ticket, Info, Clock, ArrowLeft, Loader2, Plus, Trash2, Sparkles, Percent, List
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useEvents } from "@/context/EventContext";
import { motion } from "framer-motion";

export default function CreateEventPage() {
  const router = useRouter();
  const { addEvent } = useEvents();
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState([
    { name: "General Admission", price: "0", capacity: "100" }
  ]);
  const [discounts, setDiscounts] = useState([
    { code: "", percent: "" }
  ]);
  const [agenda, setAgenda] = useState([
    { time: "", title: "", description: "" }
  ]);
  const [description, setDescription] = useState("");

  const handleAIGenerate = () => {
    // Simulated AI Generation for the Hackathon Demo
    setLoading(true);
    setTimeout(() => {
       setDescription("Experience an unforgettable gathering featuring thought-provoking sessions, interactive networking, and exclusive insights from industry leaders. This meticulously curated event is designed to inspire, connect, and elevate your perspective in a state-of-the-art environment.");
       setLoading(false);
       toast.success("AI Description generated successfully! ✨");
    }, 1500);
  };

  const addDiscount = () => setDiscounts([...discounts, { code: "", percent: "" }]);
  const removeDiscount = (index: number) => setDiscounts(discounts.filter((_, i) => i !== index));

  const addAgendaItem = () => setAgenda([...agenda, { time: "", title: "", description: "" }]);
  const removeAgendaItem = (index: number) => setAgenda(agenda.filter((_, i) => i !== index));

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
      description: description,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      venue: formData.get("venue") as string,
      tiers: tiers.map((tier, i) => ({
        id: `tier_${Math.random().toString(36).substring(2, 9)}`,
        name: (form.querySelector(`input[name="tier-name-${i}"]`) as HTMLInputElement).value,
        price: parseFloat((form.querySelector(`input[name="tier-price-${i}"]`) as HTMLInputElement).value),
        capacity: parseInt((form.querySelector(`input[name="tier-qty-${i}"]`) as HTMLInputElement).value),
      })),
      discountCodes: discounts.filter(d => d.code.trim() !== "").map((d, i) => ({
         code: (form.querySelector(`input[name="discount-code-${i}"]`) as HTMLInputElement).value,
         discountPercent: parseInt((form.querySelector(`input[name="discount-percent-${i}"]`) as HTMLInputElement).value) || 0
      })),
      agenda: agenda.filter(a => a.time.trim() !== "" || a.title.trim() !== "").map((a, i) => ({
         time: (form.querySelector(`input[name="agenda-time-${i}"]`) as HTMLInputElement).value,
         title: (form.querySelector(`input[name="agenda-title-${i}"]`) as HTMLInputElement).value,
         description: (form.querySelector(`input[name="agenda-desc-${i}"]`) as HTMLInputElement).value
      })),
    };

    try {
      const newEvent = addEvent(eventData);
      toast.success("Experience Launched! 🚀");
      router.push(`/events/${newEvent.id}`);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4 sm:p-8 relative overflow-hidden">
      <div className="mesh-gradient opacity-20" />
      
      <div className="max-w-4xl mx-auto relative z-10 pt-28">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors font-bold text-sm">
          <ArrowLeft size={18} className="text-brand-purple" /> Back to Dashboard
        </Link>

        <h1 className="text-4xl font-black mb-2 text-white">Create new <span className="text-gradient">Experience</span></h1>
        <p className="text-gray-400 mb-12 text-lg">Fill in the details to launch your event on EventSphere.</p>

        <form onSubmit={handleSubmit} className="space-y-12 pb-24">
          <section className="glass-card p-8 space-y-6 border-white/5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Info className="text-brand-purple" size={20} /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Event Title</label>
                <input name="title" required placeholder="e.g. Comedy Night" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple outline-none text-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Category</label>
                <select name="category" className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-brand-purple text-white">
                  <option className="bg-dark-bg" value="Standup Comedy">Standup Comedy</option>
                  <option className="bg-dark-bg" value="Concert">Concert</option>
                  <option className="bg-dark-bg" value="Tech Meetup">Tech Meetup</option>
                  <option className="bg-dark-bg" value="Workshop">Workshop</option>
                  <option className="bg-dark-bg" value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Performer / Speaker</label>
                <input name="performer" placeholder="e.g. John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple outline-none text-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Event Cover Image (URL)</label>
                <input name="image" type="url" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple outline-none text-white transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                <button type="button" onClick={handleAIGenerate} className="text-[10px] uppercase tracking-widest font-bold text-brand-purple flex items-center gap-1 hover:text-brand-purple-light transition-colors bg-brand-purple/10 px-2 py-1 rounded-md">
                   <Sparkles size={12} /> Auto-Generate with AI
                </button>
              </div>
              <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe what makes this event special..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-brand-purple outline-none resize-none text-white transition-all" />
            </div>
          </section>

          <section className="glass-card p-8 space-y-6 border-white/5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Calendar className="text-brand-cyan" size={20} /> Date & Venue
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Event Date</label>
                <input name="date" required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none text-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">Time</label>
                <input name="time" required type="time" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none text-white transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500">Venue</label>
              <input name="venue" required placeholder="Physical Address or Online Link" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none text-white transition-all" />
            </div>
          </section>

          <section className="glass-card p-8 space-y-6 border-white/5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Ticket className="text-brand-cyan" size={20} /> Pricing & Capacity
            </h2>
            <div className="space-y-4">
              {tiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Tier Name</label>
                    <input 
                      name={`tier-name-${index}`} 
                      required 
                      defaultValue={tier.name}
                      placeholder="e.g. Early Bird" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Price (₹)</label>
                    <input 
                      name={`tier-price-${index}`} 
                      required 
                      type="number" 
                      defaultValue={tier.price}
                      placeholder="0" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none text-white" 
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-grow space-y-2">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Qty</label>
                      <input 
                        name={`tier-qty-${index}`} 
                        required 
                        type="number" 
                        defaultValue={tier.capacity}
                        placeholder="100" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none text-white" 
                      />
                    </div>
                    {tiers.length > 1 && (
                      <button type="button" onClick={() => removeTier(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg self-end mb-1">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addTier} className="text-xs font-bold text-brand-purple flex items-center gap-1 hover:text-brand-purple-light transition-colors">
              <Plus size={14} /> Add Another Ticket Tier
            </button>
          </section>

          <section className="glass-card p-8 space-y-6 border-white/5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <Percent className="text-pink-400" size={20} /> Discount Codes <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-2 border border-white/10 px-2 py-0.5 rounded-full">Optional</span>
            </h2>
            <div className="space-y-4">
              {discounts.map((discount, index) => (
                <div key={`discount-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Code</label>
                    <input name={`discount-code-${index}`} placeholder="e.g. HACKATHON20" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none text-white uppercase" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Discount (%)</label>
                    <input name={`discount-percent-${index}`} type="number" placeholder="20" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none text-white" />
                  </div>
                  {discounts.length > 1 && (
                    <button type="button" onClick={() => removeDiscount(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg self-end mb-1">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addDiscount} className="text-xs font-bold text-brand-purple flex items-center gap-1 hover:text-brand-purple-light transition-colors">
              <Plus size={14} /> Add Another Code
            </button>
          </section>

          <section className="glass-card p-8 space-y-6 border-white/5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <List className="text-green-400" size={20} /> Event/Agenda Builder <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-2 border border-white/10 px-2 py-0.5 rounded-full">Optional</span>
            </h2>
            <div className="space-y-4">
              {agenda.map((item, index) => (
                <div key={`agenda-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Time</label>
                    <input name={`agenda-time-${index}`} placeholder="e.g. 10:00 AM" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none text-white" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Session Title</label>
                    <input name={`agenda-title-${index}`} placeholder="e.g. Opening Keynote" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none text-white mb-2" />
                    <input name={`agenda-desc-${index}`} placeholder="Brief description of the session..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 outline-none text-white text-xs" />
                  </div>
                  {agenda.length > 1 && (
                    <button type="button" onClick={() => removeAgendaItem(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg self-end mt-6">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addAgendaItem} className="text-xs font-bold text-brand-purple flex items-center gap-1 hover:text-brand-purple-light transition-colors">
              <Plus size={14} /> Add Session
            </button>
          </section>

          <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin text-white" /> : "Launch Experience 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
