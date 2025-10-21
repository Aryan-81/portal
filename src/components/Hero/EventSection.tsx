"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

type Event = {
  id: number;
  name: string;
  description: string;
  date: string;
  reg_end_date: string;
  location: string;
};

export default function EventsSection() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events/list/");
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error("Failed to load events", {
        description: err?.response?.data?.message || "Please try again later",
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleEventClick = (id: number) => {
    router.push(`/pages/events/${id}`);
  };

  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900"
    >
      <div className="relative z-10 px-6 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center"
        >
          Upcoming{" "}
          <span
            className="text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text"
          >
            Events
          </span>
        </motion.h2>

        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading events...
          </p>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No events available right now. Check back later!
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.slice(0, 6).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="rounded-2xl p-8 border transition-all duration-300 group hover:shadow-lg cursor-pointer bg-card/80 backdrop-blur-sm border-border hover:border-border/80"
                onClick={() => handleEventClick(event.id)}
              >
                <div
                  className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10m-12 6h14m-14 4h14"
                    />
                  </svg>
                </div>
                <span
                  className="text-blue-600 dark:text-cyan-400 text-sm font-semibold mb-2 block"
                >
                  {formatDate(event.date)}
                </span>
                <h3
                  className="text-xl font-bold text-foreground mb-3 line-clamp-1"
                >
                  {event.name}
                </h3>
                <p
                  className="text-muted-foreground leading-relaxed line-clamp-3"
                >
                  {event.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}