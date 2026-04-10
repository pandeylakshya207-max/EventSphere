"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, MapPin, Ticket, Info, ArrowLeft,
  Loader2, Plus, Trash2, Sparkles, Percent, List
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabase";

export default function CreateEventPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const handleAIGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setDescription(
        "Experience an unforgettable gathering featuring thought-provoking sessions, networking, and insights from industry leaders."
      );
      setLoading(false);
      toast.success("AI Description generated ✨");
    }, 1000);
  };

  // ✅ FINAL SUBMIT FUNCTION (SUPABASE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    const image = formData.get("image") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const location = formData.get("venue") as string;

    // combine date + time
    const fullDate = new Date(`${date}T${time}`);

    const { error } = await supabase.from("events").insert([
      {
        title,
        description,
        date: fullDate.toISOString(),
        location,
        image,
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Failed to create event ❌");
    } else {
      toast.success("Event created successfully 🚀");
      router.push("/events");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg p-6 pt-28">
      <div className="max-w-3xl mx-auto">

        <Link href="/events" className="text-gray-400 flex gap-2 mb-6">
          <ArrowLeft /> Back
        </Link>

        <h1 className="text-3xl font-bold text-white mb-6">
          Create Event
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TITLE */}
          <input
            name="title"
            required
            placeholder="Event Title"
            className="w-full p-3 rounded bg-white/5 text-white"
          />

          {/* IMAGE */}
          <input
            name="image"
            placeholder="Image URL"
            className="w-full p-3 rounded bg-white/5 text-white"
          />

          {/* DESCRIPTION */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-3 rounded bg-white/5 text-white"
          />

          <button
            type="button"
            onClick={handleAIGenerate}
            className="text-sm text-purple-400"
          >
            Generate with AI ✨
          </button>

          {/* DATE */}
          <input
            name="date"
            type="date"
            required
            className="w-full p-3 rounded bg-white/5 text-white"
          />

          {/* TIME */}
          <input
            name="time"
            type="time"
            required
            className="w-full p-3 rounded bg-white/5 text-white"
          />

          {/* LOCATION */}
          <input
            name="venue"
            placeholder="Location"
            required
            className="w-full p-3 rounded bg-white/5 text-white"
          />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 py-3 rounded text-white"
          >
            {loading ? "Creating..." : "Create Event 🚀"}
          </button>

        </form>
      </div>
    </div>
  );
}

