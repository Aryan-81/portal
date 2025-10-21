"use client";
import { motion } from "framer-motion";
import { useContent } from "@/context/ContentContext";
import { useState } from "react";

export default function PrototypesSection() {
  const { content, loading, error } = useContent();
  const [selectedPrototype, setSelectedPrototype] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Loading state
  if (loading && !content.prototypes) {
    return (
      <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-green-900 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Loading prototypes...
          </p>
        </div>
      </section>
    );
  }

  // Error state
  if (error && !content.prototypes) {
    return (
      <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-green-900 dark:to-slate-900">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Error loading prototypes content</p>
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

  // Fallback content if no prototypes data
  const prototypesData = content.prototypes?.prototypes || [
    {
      title: "Crepe bandage Applicator",
      description: "",
      category: [""],
      year: "2024",
      inventors: ["Honey Baranwal", "Mayur Kumar"],
      images: ["http://72.60.102.111:8000/media/uploads/crepe-bandage.png"],
      video: [""],
      event: "Invention Factory 2024"
    },
    {
      title: "Fluid Flex Sensor",
      description: "",
      category: [""],
      year: "2024",
      inventors: ["Romit Mohane", "Vinati Mehta"],
      images: ["http://72.60.102.111:8000/media/uploads/flexi-sensor.png"],
      video: [""],
      event: "Invention Factory 2024"
    }
  ];

  const openModal = (prototype: any) => {
    setSelectedPrototype(prototype);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrototype(null);
  };

  // Function to handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  // Function to check if file is PDF
  const isPDF = (url: string) => {
    return url.toLowerCase().endsWith('.pdf');
  };

  // Function to get event color
  const getEventColor = (event: string) => {
    if (event.includes("InventX")) return "from-purple-500 to-pink-500";
    if (event.includes("Invention Factory")) return "from-blue-500 to-cyan-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <>
      <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-green-900 dark:to-slate-900 py-16">
        <div className="relative z-10 px-6 max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center"
          >
            Student{" "}
            <span className="text-transparent bg-gradient-to-r from-green-600 to-cyan-600 dark:from-green-400 dark:to-cyan-400 bg-clip-text">
              Prototypes
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prototypesData.map((prototype: any, index: number) => (
              <motion.div
                key={`${prototype.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="rounded-2xl p-6 border transition-all duration-300 group hover:shadow-xl bg-card/80 backdrop-blur-sm border-border hover:border-green-400/30 cursor-pointer"
                onClick={() => openModal(prototype)}
              >
                {/* Image Preview */}
                {prototype.images && prototype.images[0] && (
                  <div className="mb-4 rounded-lg overflow-hidden h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {isPDF(prototype.images[0]) ? (
                      <div className="text-center p-4">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-sm text-muted-foreground">PDF Document</span>
                      </div>
                    ) : (
                      <img 
                        src={prototype.images[0]} 
                        alt={prototype.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                )}

                {/* Event Badge */}
                {prototype.event && (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-gradient-to-r ${getEventColor(prototype.event)} text-white`}>
                    {prototype.event}
                  </div>
                )}

                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                  {prototype.title}
                </h3>

                {/* Description Preview */}
                <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3 text-sm">
                  {prototype.description || "Innovative student prototype showcasing cutting-edge technology and design thinking."}
                </p>

                {/* Inventors */}
                {prototype.inventors && prototype.inventors[0] && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{prototype.inventors.slice(0, 2).join(", ")}</span>
                    {prototype.inventors.length > 2 && <span>+{prototype.inventors.length - 2} more</span>}
                  </div>
                )}

                {/* Year */}
                {prototype.year && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {prototype.year}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for Detailed View */}
      {isModalOpen && selectedPrototype && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  {selectedPrototype.event && (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-3 bg-gradient-to-r ${getEventColor(selectedPrototype.event)} text-white`}>
                      {selectedPrototype.event}
                    </div>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {selectedPrototype.title}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Images */}
              {selectedPrototype.images && selectedPrototype.images[0] && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPrototype.images.map((image: string, index: number) => (
                      image && (
                        <div key={index} className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {isPDF(image) ? (
                            <div className="p-8 text-center">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <p className="text-muted-foreground mb-4">PDF Document</p>
                              <a 
                                href={image} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                View PDF
                              </a>
                            </div>
                          ) : (
                            <img 
                              src={image} 
                              alt={`${selectedPrototype.title} - Image ${index + 1}`}
                              className="w-full h-64 object-cover"
                              onError={handleImageError}
                            />
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Inventors */}
                {selectedPrototype.inventors && selectedPrototype.inventors[0] && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Inventors</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrototype.inventors.map((inventor: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-accent rounded-full text-sm">
                          {inventor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Year */}
                {selectedPrototype.year && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Year</h3>
                    <p className="text-green-600 dark:text-green-400 font-semibold">{selectedPrototype.year}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedPrototype.description && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedPrototype.description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}