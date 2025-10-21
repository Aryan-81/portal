import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { motion } from "framer-motion";
import { FaHistory } from "react-icons/fa";
import { useContent } from "@/context/ContentContext";

const HistorySection = () => {
  const { content, loading, error } = useContent();

  // Loading state
  if (loading && !content.history) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-100 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Loading history...
          </p>
        </div>
      </section>
    );
  }

  // Error state
  if (error && !content.history) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-100 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Error loading history content</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg font-semibold border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Fallback content if no history data
  const historyData = content.history?.timeline || [
    {
      year: "2019",
      event: "Founding of I2EDC",
      description: "Established the innovation cell to foster student entrepreneurship"
    },
    {
      year: "2020",
      event: "Launch of Protospace",
      description: "Opened our state-of-the-art prototyping facility"
    },
    {
      year: "2022",
      event: "Annual Innovation Summit",
      description: "Hosted our first major innovation conference"
    },
    {
      year: "2023",
      event: "Expanded Labs",
      description: "Added AI, Robotics, and IoT labs for students"
    },
    {
      year: "2024",
      event: "National Collaboration",
      description: "Partnered with institutes for nationwide innovation programs"
    }
  ];

  return (
    <section
      className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-100 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900"
    >
      <div className="max-w-5xl w-full px-6 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-12 text-center text-foreground"
        >
          I2EDC{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400">
            History
          </span>
        </motion.h2>

        <VerticalTimeline lineColor="currentColor" className="text-blue-500 dark:text-cyan-500">
          {historyData.map((milestone:any, index:any) => (
            <VerticalTimelineElement
              key={`${milestone.year}-${index}`}
              date={milestone.year}
              iconStyle={{
                background: "#3b82f6",
                color: "#fff",
              }}
              icon={<FaHistory />}
              contentStyle={{
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
                marginBottom: "-70px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              contentArrowStyle={{
                borderRight: "7px solid hsl(var(--border))",
              }}
              dateClassName="text-foreground font-semibold"
            >
              <h3 className="text-xl font-bold mb-2 text-card-foreground">{milestone.event}</h3>
              <p className="text-muted-foreground">
                {milestone.description}
              </p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </section>
  );
};

export default HistorySection;