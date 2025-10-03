// Hero.tsx - Updated version
"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ServicesSection from "./ServicesSection";
import PrototypesSection from "./PrototypesSection";
import TeamSection from "./TeamSection";
import LiquidEther from "../animations/LiquidEther/LiquidEther";
import { useTheme } from "next-themes";
import HistorySection from "./HistorySection";
import EventsSection from "./EventSection";
import { homeAboutData as aboutData } from "@/data/data";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};
export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const isScrolling = useRef(false);
  const sections = useRef<HTMLElement[]>([]);

  // Register sections
  useEffect(() => {
    const updateSections = () => {
      sections.current = Array.from(document.querySelectorAll("section"));
    };
    updateSections();
    window.addEventListener("resize", updateSections);
    return () => window.removeEventListener("resize", updateSections);
  }, []);

  // Handle scroll + keyboard
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling.current) return;

      isScrolling.current = true;

      if (e.deltaY > 0) {
        setCurrentSection((prev) =>
          Math.min(prev + 1, sections.current.length - 1)
        );
      } else {
        setCurrentSection((prev) => Math.max(prev - 1, 0));
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling.current) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        isScrolling.current = true;
        setCurrentSection((prev) =>
          Math.min(prev + 1, sections.current.length - 1)
        );
        setTimeout(() => (isScrolling.current = false), 200);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        isScrolling.current = true;
        setCurrentSection((prev) => Math.max(prev - 1, 0));
        setTimeout(() => (isScrolling.current = false), 200);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Scroll to the current section
  useEffect(() => {
    if (sections.current.length > 0 && sections.current[currentSection]) {
      isScrolling.current = true;
      window.scrollTo({
        top: sections.current[currentSection].offsetTop,
        behavior: "smooth",
      });

      setTimeout(() => {
        isScrolling.current = false;
      }, 200);
    }
  }, [currentSection]);

  return (
    <div className="relative">
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <HistorySection />
      <EventsSection />
      <PrototypesSection />
      <TeamSection />
    </div>
  );
}

export const HeroSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <LiquidEther />
      </div>

      {/* Hero Content */}
      <div
        className={`relative z-10 h-full flex flex-col justify-center items-center text-center px-6 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span
              className={`bg-gradient-to-r ${
                isDark
                  ? "from-blue-400 to-purple-600"
                  : "from-blue-600 to-purple-700"
              } bg-clip-text text-transparent`}
            >
              Innovate.
            </span>{" "}
            <span
              className={`bg-gradient-to-r ${
                isDark
                  ? "from-green-400 to-cyan-600"
                  : "from-green-600 to-cyan-700"
              } bg-clip-text text-transparent`}
            >
              Create.
            </span>{" "}
            <span
              className={`bg-gradient-to-r ${
                isDark
                  ? "from-orange-400 to-pink-600"
                  : "from-orange-600 to-pink-700"
              } bg-clip-text text-transparent`}
            >
              Transform.
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            The Institute Innovation Entrepreneurship Development Cell (I2EDC)
            is a hub for student innovators and entrepreneurs. We provide
            resources, mentorship, and a vibrant community to help you bring
            your ideas to life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 border ${
                isDark
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400/30 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  : "bg-gradient-to-r from-blue-600 to-purple-700 text-white border-blue-500/30 shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40"
              }`}
              onClick={() => scrollToSection("explore")}
            >
              Explore I2EDC
            </motion.button>
            <Link href="/auth" scroll={false}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-lg font-semibold border transition-all duration-300 ${
                  isDark
                    ? "bg-transparent text-white border-white/30 hover:bg-white/10"
                    : "bg-transparent text-gray-800 border-gray-400 hover:bg-gray-100/50"
                }`}
              >
                Join Community
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-6 h-10 border-2 rounded-full flex justify-center ${
            isDark ? "border-white/50" : "border-gray-400"
          }`}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-1 h-3 rounded-full mt-2 ${
              isDark ? "bg-white/70" : "bg-gray-600"
            }`}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

const AboutSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme-based styles
  const sectionBg = isDark
    ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    : "bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50";

  const cardBg = isDark
    ? "bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20"
    : "bg-white/80 backdrop-blur-sm border-gray-200 hover:border-gray-300";

  const titleColor = isDark ? "text-white" : "text-gray-900";
  const textColor = isDark ? "text-gray-300" : "text-gray-700";
  const subtitleGradient = isDark
    ? "from-blue-400 to-purple-400"
    : "from-blue-600 to-purple-600";

  return (
    <section
      className={`relative w-full min-h-screen flex items-center justify-center ${sectionBg}`}
      id="explore"
    >
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`text-4xl md:text-5xl font-bold ${titleColor} mb-4`}
        >
          {aboutData.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`text-lg md:text-xl ${textColor} mb-12 max-w-2xl mx-auto`}
        >
          {aboutData.subtitle}
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8">
          {aboutData.offerings.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`rounded-2xl p-8 border transition-all duration-300 hover:shadow-lg ${cardBg}`}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.gradient} mb-6 flex items-center justify-center`}
              >
                {item.icon}
              </div>
              <h3 className={`text-xl font-bold ${titleColor} mb-4`}>
                {item.title}
              </h3>
              <p className={`leading-relaxed ${textColor}`}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
