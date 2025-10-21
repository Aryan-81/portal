// TeamSection.tsx
"use client";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useContent } from "@/context/ContentContext";
import { useState, useEffect, useMemo } from "react";

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  club?: string;
}

interface TeamData {
  core_members?: TeamMember[];
  ps_tl_members?: TeamMember[];
  e_cell_members?: TeamMember[];
  bec_members?: TeamMember[];
}

const TeamSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { content, loading, error } = useContent();
  const [activeClub, setActiveClub] = useState("core");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize active club once data is loaded
  useEffect(() => {
    if (!loading && content.team && !isInitialized) {
      const teamData = content.team as TeamData;
      const clubs = [
        { key: "core", members: teamData.core_members },
        { key: "ps_tl", members: teamData.ps_tl_members },
        { key: "e_cell", members: teamData.e_cell_members },
        { key: "bec", members: teamData.bec_members },
      ];

      const firstValidClub = clubs.find(club => club.members && club.members.length > 0);
      if (firstValidClub && firstValidClub.key !== activeClub) {
        setActiveClub(firstValidClub.key);
      }
      setIsInitialized(true);
    }
  }, [loading, content.team, activeClub, isInitialized]);

  // Safe data access with fallbacks
  const teamData = useMemo(() => content.team as TeamData || {}, [content.team]);
  
  const core_members = teamData.core_members || [];
  const ps_tl_members = teamData.ps_tl_members || [];
  const e_cell_members = teamData.e_cell_members || [];
  const bec_members = teamData.bec_members || [];

  const hasNoData = useMemo(() => 
    core_members.length === 0 && 
    ps_tl_members.length === 0 && 
    e_cell_members.length === 0 && 
    bec_members.length === 0,
    [core_members, ps_tl_members, e_cell_members, bec_members]
  );

  // Club configuration
  const clubConfig = useMemo(() => ({
    core: {
      gradient: "from-cyan-500 to-blue-600",
      displayName: "I2EDC Core Team",
      tabLabel: "I2EDC Core",
      members: core_members,
    },
    ps_tl: {
      gradient: "from-purple-500 to-pink-600",
      displayName: "ProtoSpace & Tinkering Lab",
      tabLabel: "ProtoSpace & TL",
      members: ps_tl_members,
    },
    e_cell: {
      gradient: "from-green-500 to-emerald-600",
      displayName: "Entrepreneurship Cell",
      tabLabel: "E-Cell",
      members: e_cell_members,
    },
    bec: {
      gradient: "from-orange-500 to-red-600",
      displayName: "Budding Entrepreneur Club",
      tabLabel: "BEC",
      members: bec_members,
    },
  }), [core_members, ps_tl_members, e_cell_members, bec_members]);

  // Available tabs with members
  const clubTabs = useMemo(() => 
    Object.entries(clubConfig)
      .filter(([_, config]) => config.members.length > 0)
      .map(([key, config]) => ({
        key,
        label: config.tabLabel,
        members: config.members,
        gradient: config.gradient,
        displayName: config.displayName,
      })),
    [clubConfig]
  );

  // Current team members
  const currentTeam = useMemo(() => 
    clubConfig[activeClub as keyof typeof clubConfig]?.members || [],
    [activeClub, clubConfig]
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.fallback-avatar')) {
      const fallback = document.createElement('div');
      fallback.className = 'fallback-avatar w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg';
      fallback.textContent = target.alt?.charAt(0) || '?';
      parent.appendChild(fallback);
    }
  };

  const renderTeam = (members: TeamMember[], delayBase = 0) => {
    if (!members || members.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-8"
        >
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            No members found for this team
          </p>
        </motion.div>
      );
    }

    return (
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {members.map((member, index) => (
          <motion.div
            key={`${member.name}-${index}-${member.role}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delayBase + index * 0.1 }}
            className={`${
              isDark
                ? "bg-white/10 border-white/20 hover:border-cyan-400/40"
                : "bg-black/5 border-black/10 hover:border-cyan-600/40"
            } backdrop-blur-md p-6 rounded-xl border flex flex-col items-center group w-64 transition-all duration-300 hover:shadow-lg`}
          >
            <div className="w-32 h-32 mb-4 overflow-hidden rounded-full border-2 border-white/30 relative">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {member.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            
            <h3 className={`text-lg font-bold text-center ${
              isDark ? "text-white" : "text-gray-900"
            } mb-1`}>
              {member.name || 'Unknown Member'}
            </h3>
            
            <div className="text-center mb-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                isDark ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-500/20 text-cyan-700"
              }`}>
                {member.club || 'I2EDC'}
              </span>
            </div>
            
            <p className={`${isDark ? "text-slate-300" : "text-gray-600"} text-sm text-center`}>
              {member.role || 'Team Member'}
            </p>
          </motion.div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading && !content.team) {
    return <LoadingState isDark={isDark} message="Loading team..." />;
  }

  // Error state
  if (error && !content.team) {
    return <ErrorState isDark={isDark} onRetry={() => window.location.reload()} />;
  }

  // No data state
  if (hasNoData) {
    return <NoDataState isDark={isDark} onRetry={() => window.location.reload()} />;
  }

  // No tabs available
  if (clubTabs.length === 0) {
    return <NoDataState isDark={isDark} onRetry={() => window.location.reload()} />;
  }

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-16">
      <div className="relative z-2 text-center px-4 max-w-7xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`text-3xl md:text-4xl lg:text-5xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } mb-12 font-serif`}
        >
          Meet Our Team
        </motion.h2>

        {/* Club Navigation Tabs */}
        {clubTabs.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {clubTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveClub(tab.key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeClub === tab.key
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                    : isDark
                    ? "bg-white/10 text-white/70 hover:bg-white/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.members.length})
              </button>
            ))}
          </motion.div>
        )}

        {/* Active Club Title - FIXED: Only one instance */}
        <motion.h3
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r ${
            clubConfig[activeClub as keyof typeof clubConfig]?.gradient || "from-gray-500 to-gray-600"
          } bg-clip-text text-transparent`}
        >
          {clubConfig[activeClub as keyof typeof clubConfig]?.displayName || "Team"}
        </motion.h3>

        {/* Team Members Grid */}
        <motion.div
          key={activeClub} // This ensures re-animation on club change
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {renderTeam(currentTeam)}
        </motion.div>

        {/* Club Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`mt-12 p-6 rounded-2xl backdrop-blur-sm ${
            isDark ? "bg-white/10 border-white/20" : "bg-black/5 border-black/10"
          } border`}
        >
          <h4 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Team Overview
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {clubTabs.map((tab) => (
              <div key={tab.key} className="text-center">
                <div className={`text-2xl font-bold bg-gradient-to-r ${tab.gradient} bg-clip-text text-transparent`}>
                  {tab.members.length}
                </div>
                <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {tab.label} Members
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Extracted components for better organization
const LoadingState = ({ isDark, message }: { isDark: boolean; message: string }) => (
  <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
      <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {message}
      </p>
    </div>
  </section>
);

const ErrorState = ({ isDark, onRetry }: { isDark: boolean; onRetry: () => void }) => (
  <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
    <div className="text-center">
      <p className="text-lg text-red-500 mb-4">Error loading team content</p>
      <button 
        onClick={onRetry}
        className={`px-6 py-3 rounded-lg font-semibold ${
          isDark 
            ? "bg-white/10 text-white border border-white/30" 
            : "bg-gray-100 text-gray-800 border border-gray-300"
        }`}
      >
        Retry
      </button>
    </div>
  </section>
);

const NoDataState = ({ isDark, onRetry }: { isDark: boolean; onRetry: () => void }) => (
  <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
    <div className="text-center">
      <p className={`text-lg ${isDark ? "text-gray-300" : "text-gray-700"} mb-4`}>
        No team data available
      </p>
      <button 
        onClick={onRetry}
        className={`px-6 py-3 rounded-lg font-semibold ${
          isDark 
            ? "bg-white/10 text-white border border-white/30" 
            : "bg-gray-100 text-gray-800 border border-gray-300"
        }`}
      >
        Retry
      </button>
    </div>
  </section>
);

export default TeamSection;