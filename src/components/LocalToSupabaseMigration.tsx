"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/../lib/supabase"; // adjust if needed. It's actually at `lib/supabase.ts` so `../../../lib/supabase` or `@/lib/supabase` if aliased.

export function LocalToSupabaseMigration() {
  const hasMigrated = useRef(false);

  useEffect(() => {
    const runMigration = async () => {
      // Prevent double running in StrictMode
      if (hasMigrated.current) return;
      hasMigrated.current = true;

      const isMigrated = localStorage.getItem("es_migrated");
      const storedEvents = localStorage.getItem("es_events");

      if (!isMigrated && storedEvents) {
        try {
          const events = JSON.parse(storedEvents);
          if (Array.isArray(events) && events.length > 0) {
            // Transform
            const mappedEvents = events.map((e: any) => {
              // Combine date and time
              let isoDate = e.date;
              if (e.time) {
                try {
                  isoDate = new Date(`${e.date}T${e.time}`).toISOString();
                } catch (err) {
                  console.warn("Date parsing error", err);
                }
              }

              return {
                title: e.title || "Untitled Event",
                description: e.description || "",
                date: isoDate,
                location: e.venue || "TBD",
                image: e.image || "",
              };
            });

            // Insert
            const { error } = await supabase.from("events").insert(mappedEvents);
            
            if (error) {
              console.error("Migration failed:", error);
            } else {
              console.info("Successfully migrated old events to Supabase!");
              localStorage.setItem("es_migrated", "true");
            }
          } else {
            // If empty array, mark as migrated anyway
            localStorage.setItem("es_migrated", "true");
          }
        } catch (err) {
          console.error("Error running migration", err);
        }
      } else if (!isMigrated && !storedEvents) {
        // No stored events left to migrate, mark as done
        localStorage.setItem("es_migrated", "true");
      }
    };

    runMigration();
  }, []);

  return null;
}

