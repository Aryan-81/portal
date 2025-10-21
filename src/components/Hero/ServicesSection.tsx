"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useContent } from "@/context/ContentContext";

const ServicesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { content, loading, error } = useContent();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (loading && !content.services) {
    return (
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-16 bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-cyan-900 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Loading services...
          </p>
        </div>
      </section>
    );
  }

  // Error state
  if (error && !content.services) {
    return (
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-16 bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-cyan-900 dark:to-slate-900">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Error loading services content</p>
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

  // Fallback content if no services data
  const servicesData = content.services?.Services || [
    {
      Sr_No: 1,
      Service: "3D Scanner",
      Unit: "per Minute",
      Rate_INR: 40,
      image: "http://72.60.102.111:8000/media/uploads/3d-scanner.png"
    },
    {
      Sr_No: 2,
      Service: "PCB Soldering Machine",
      Unit: "per Minute",
      Rate_INR: 80,
      image: "http://72.60.102.111:8000/media/uploads/pcb-printing-machine.png"
    },
    {
      Sr_No: 3,
      Service: "Dual Extruder Water dissolves support 3D printing",
      Unit: "per Hour",
      Rate_INR: 170,
      image: "http://72.60.102.111:8000/media/uploads/dual-nozzle-3d-printer.png"
    }
  ];

  const requesterCharges = content.services?.Requester_Charges || [
    {
      Requester: "IIT Jammu Students",
      Visit_Space_Charges_INR: 0,
      Usage_Charges: "N"
    },
    {
      Requester: "Existing Clubs",
      Visit_Space_Charges_INR: 0,
      Usage_Charges: "N"
    }
  ];

  // Function to handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-16 bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-cyan-900 dark:to-slate-900"
    >
      <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent"
        >
          Manufacturing Services & Pricing
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-16 max-w-3xl mx-auto font-light tracking-wide text-muted-foreground"
        >
          State-of-the-art equipment and transparent pricing for all your prototyping needs
        </motion.p>

        {/* Services Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="backdrop-blur-sm rounded-xl border overflow-hidden mb-16 bg-card/80 border-border hover:border-cyan-400/40 dark:hover:border-cyan-500/40 transition-colors duration-300"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="py-4 px-6 text-left font-semibold text-sm uppercase tracking-wider text-foreground">Service</th>
                  <th className="py-4 px-6 text-left font-semibold text-sm uppercase tracking-wider text-foreground">Image</th>
                  <th className="py-4 px-6 text-left font-semibold text-sm uppercase tracking-wider text-foreground">Unit</th>
                  <th className="py-4 px-6 text-left font-semibold text-sm uppercase tracking-wider text-foreground">Rate (INR)</th>
                </tr>
              </thead>
              <tbody>
                {servicesData.map((service: any, index: number) => (
                  <motion.tr
                    key={service.Sr_No}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isVisible ? 1 : 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="border-b border-border bg-background/50 hover:bg-accent/50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <span className="font-semibold text-foreground">
                          {service.Service}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {service.image ? (
                        <img 
                          src={service.image} 
                          alt={service.Service}
                          className="w-16 h-16 object-contain rounded-lg"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-muted-foreground">{service.Unit}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        ₹{service.Rate_INR}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Requester Charges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold mb-8 text-foreground">
            Pricing Categories
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requesterCharges.map((requester: any, index: number) => (
              <motion.div
                key={requester.Requester}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                className="backdrop-blur-sm rounded-xl p-6 border bg-card/80 border-border hover:border-cyan-400/40 dark:hover:border-cyan-500/40 transition-colors duration-300"
              >
                <h4 className="text-xl font-bold mb-3 text-foreground">
                  {requester.Requester}
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-muted-foreground">Visit Charges: </span>
                    <span className={requester.Visit_Space_Charges_INR === 0 || requester.Visit_Space_Charges_INR === "N" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                      {requester.Visit_Space_Charges_INR === 0 ? "Free" : 
                       requester.Visit_Space_Charges_INR === "N" ? "Not Applicable" : 
                       `₹${requester.Visit_Space_Charges_INR}`}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Usage Charges: </span>
                    <span className={requester.Usage_Charges === "N" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                      {requester.Usage_Charges === "N" ? "Free" : requester.Usage_Charges}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto bg-gradient-to-r from-background to-muted/50 dark:from-gray-800/40 dark:to-gray-900/40 border border-border"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Ready to Start Your Project?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Get access to our advanced manufacturing facilities with transparent pricing
          </p>
          <Link href={"/pages/contact#form"}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium 
                     shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 
                     border border-cyan-400/30 flex items-center gap-2 mx-auto"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Book a Service
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
export default ServicesSection;